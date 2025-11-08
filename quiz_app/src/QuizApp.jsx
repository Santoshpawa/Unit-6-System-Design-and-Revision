import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// --- Static Data: Quiz Questions ---
const QUIZ_DATA = [
  {
    question: "What built-in method adds one or more elements to the end of an array and returns the new length?",
    options: ["last()", "put()", "push()", "pop()"],
    answer: "push()",
  },
  {
    question: "Which hook is used for performing side effects in functional components?",
    options: ["useState", "useContext", "useEffect", "useReducer"],
    answer: "useEffect",
  },
  {
    question: "What is the primary way to style a React component when using Tailwind CSS?",
    options: ["Inline <style> tags", "Separate .css files", "Utility classes in className", "CSS-in-JS libraries"],
    answer: "Utility classes in className",
  },
  {
    question: "In JavaScript, what is the scope of a variable declared with 'let'?",
    options: ["Global scope", "Function scope", "Block scope", "Object scope"],
    answer: "Block scope",
  },
  {
    question: "Which of these is NOT a principle of React's Unidirectional Data Flow?",
    options: ["Data moves top-down", "Parent components control child state", "State mutation is encouraged", "Props are read-only"],
    answer: "State mutation is encouraged",
  },
  {
    question: "What is JSX?",
    options: ["A JavaScript library", "A syntax extension for JavaScript", "A CSS preprocessor", "A state management tool"],
    answer: "A syntax extension for JavaScript",
  },
  {
    question: "What symbol is used to pass multiple elements as an array in React render methods?",
    options: ["{}", "[]", "<>", "()"],
    answer: "<>",
  },
];

// --- Constants ---
const TIME_LIMIT = 15; // seconds per question
const POST_ANSWER_DELAY = 2000; // ms to show feedback

// --- Main Quiz Component ---
const QuizApp = () => {
  // --- Core Quiz State ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // --- Per-Question State ---
  const [timer, setTimer] = useState(TIME_LIMIT);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', 'skipped'
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  // --- Timer Tracking for Analytics ---
  const questionStartTimeRef = useRef(Date.now()); // Tracks when the question started

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  const totalQuestions = QUIZ_DATA.length;

  // --- Reset Function ---
  const restartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizHistory([]);
    setQuizStarted(true);
    setQuizFinished(false);
    setTimer(TIME_LIMIT);
    setSelectedAnswer(null);
    setFeedback(null);
    setIsAnswerLocked(false);
    questionStartTimeRef.current = Date.now();
  }, []);

  // --- Progress to Next Question Logic ---
  const advanceQuestion = useCallback((status, selection, timeTaken = 0) => {
    setIsAnswerLocked(true);

    // Record the result in history
    const historyEntry = {
      question: currentQuestion.question,
      selectedAnswer: selection,
      correctAnswer: currentQuestion.answer,
      status: status, // 'correct', 'wrong', or 'skipped'
      timeTaken: timeTaken, // 0 for skipped/timeout
    };

    setQuizHistory(prev => [...prev, historyEntry]);

    // Check if the quiz is finished
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= totalQuestions) {
      setTimeout(() => {
        setQuizFinished(true);
        setIsAnswerLocked(false);
      }, status === 'skipped' ? 0 : POST_ANSWER_DELAY); // No delay for skip/timeout
      return;
    }

    // Move to the next question after a delay (or immediately for skip)
    setTimeout(() => {
      setCurrentQuestionIndex(nextIndex);
      setTimer(TIME_LIMIT);
      setSelectedAnswer(null);
      setFeedback(null);
      setIsAnswerLocked(false);
      questionStartTimeRef.current = Date.now(); // Reset start time for the next question
    }, status === 'skipped' ? 0 : POST_ANSWER_DELAY);

  }, [currentQuestionIndex, totalQuestions, currentQuestion]);

  // --- Handle User Answer Selection ---
  const handleAnswerClick = (option) => {
    if (isAnswerLocked) return;

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.answer;
    const timeTaken = Date.now() - questionStartTimeRef.current;

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
      advanceQuestion('correct', option, timeTaken);
    } else {
      setScore(s => s + 0); // Score remains the same
      setFeedback('wrong');
      advanceQuestion('wrong', option, timeTaken);
    }
  };

  // --- Handle Skip Question ---
  const handleSkipQuestion = () => {
    if (isAnswerLocked) return;

    setScore(s => s - 1); // Deduct 1 point for skipping
    setFeedback('skipped');
    advanceQuestion('skipped', 'N/A', 0);
  };


  // --- Timer Effect (Runs every second) ---
  useEffect(() => {
    if (quizFinished || !quizStarted || isAnswerLocked) return;

    const timerId = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          // Auto-advance due to timeout (marked as wrong, score 0)
          advanceQuestion('wrong', 'Timeout', TIME_LIMIT * 1000); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup: clear the interval when the component unmounts or state changes
    return () => clearInterval(timerId);
  }, [quizFinished, quizStarted, isAnswerLocked, advanceQuestion]);

  // --- Progress Bar Calculation ---
  const progressPercentage = (currentQuestionIndex / totalQuestions) * 100;

  // --- Summary Calculations (useMemo for efficiency) ---
  const summary = useMemo(() => {
    if (!quizFinished) return null;

    const correct = quizHistory.filter(h => h.status === 'correct').length;
    const wrong = quizHistory.filter(h => h.status === 'wrong').length;
    const skipped = quizHistory.filter(h => h.status === 'skipped').length;
    
    // Find longest answer time
    const answeredHistory = quizHistory.filter(h => h.status !== 'skipped');
    const longestTimeEntry = answeredHistory.reduce((max, current) => 
        (current.timeTaken > max.timeTaken ? current : max), 
        { timeTaken: 0, question: '' }
    );
    
    // Find the ID of the question with the longest time (for highlighting)
    const longestTimeQuestionText = longestTimeEntry.question;

    return { correct, wrong, skipped, longestTimeEntry, longestTimeQuestionText };
  }, [quizFinished, quizHistory]);

  // --- Conditional Rendering: Start Screen ---
  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-indigo-400 mb-4 text-center">
            React Quick Quiz
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Test your knowledge! You have **15 seconds** per question.
          </p>
          <div className="space-y-3 mb-8 text-sm p-4 bg-gray-700 rounded-lg">
            <p><span className="font-bold text-green-400">+1 Point:</span> Correct Answer (ends timer)</p>
            <p><span className="font-bold text-red-400">0 Points:</span> Wrong Answer or Timeout (ends timer)</p>
            <p><span className="font-bold text-yellow-400">-1 Point:</span> Question Skipped</p>
          </div>
          <button 
            onClick={() => restartQuiz()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold rounded-lg shadow-md transition duration-200"
          >
            Start Quiz!
          </button>
        </div>
      </div>
    );
  }

  // --- Conditional Rendering: Summary Screen ---
  if (quizFinished && summary) {
    const { correct, wrong, skipped, longestTimeEntry, longestTimeQuestionText } = summary;
    const totalTimeTaken = quizHistory.reduce((acc, h) => acc + h.timeTaken, 0) / 1000;

    const getScoreColor = (finalScore) => {
        if (finalScore > totalQuestions / 2) return 'text-green-400';
        if (finalScore > 0) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl w-full p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-5xl font-extrabold mb-6 text-center text-indigo-400">
            Quiz Complete!
          </h1>
          <div className="p-6 mb-8 bg-gray-700 rounded-lg text-center">
            <p className="text-xl font-bold mb-2">Final Score</p>
            <p className={`text-6xl font-black ${getScoreColor(score)}`}>{score}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
            <div className="p-3 bg-green-900/50 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{correct}</p>
                <p className="text-xs text-green-300">Correct</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded-lg">
                <p className="text-2xl font-bold text-red-400">{wrong}</p>
                <p className="text-xs text-red-300">Wrong/Timeout</p>
            </div>
            <div className="p-3 bg-yellow-900/50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">{skipped}</p>
                <p className="text-xs text-yellow-300">Skipped</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{totalTimeTaken.toFixed(1)}s</p>
                <p className="text-xs text-blue-300">Total Time</p>
            </div>
          </div>
          
          <p className="text-lg font-semibold mb-4 text-gray-300">
            Longest Answer Time: 
            <span className="text-indigo-300 ml-2">
                {longestTimeEntry.timeTaken > 0 ? `${(longestTimeEntry.timeTaken / 1000).toFixed(2)}s` : 'N/A'}
            </span>
          </p>

          <button 
            onClick={restartQuiz}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold rounded-lg shadow-md transition duration-200"
          >
            Restart Quiz
          </button>

          {/* History Display */}
          <h2 className="text-3xl font-bold mt-10 mb-4 text-indigo-300 border-t border-gray-700 pt-6">
            Review Answers
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {quizHistory.map((h, index) => {
              const statusClass = h.status === 'correct' ? 'border-green-500 bg-green-900/20' :
                                 h.status === 'wrong' ? 'border-red-500 bg-red-900/20' :
                                 'border-yellow-500 bg-yellow-900/20';
              
              const longestTimeClass = h.question === longestTimeQuestionText && h.status !== 'skipped' 
                                      ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800' : '';

              return (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${statusClass} ${longestTimeClass}`}>
                  <p className="text-sm text-gray-400 mb-1">
                    Q{index + 1}: {h.question}
                  </p>
                  <p className="text-base font-semibold">
                    Your Answer: 
                    <span className={h.status === 'correct' ? 'text-green-400' : 'text-red-400'}>
                        {h.selectedAnswer}
                    </span>
                  </p>
                  {h.status === 'wrong' && (
                    <p className="text-sm text-yellow-400">
                      Correct: {h.correctAnswer}
                    </p>
                  )}
                  {h.status !== 'skipped' && (
                     <p className="text-xs text-indigo-400 mt-1">
                        Time: {(h.timeTaken / 1000).toFixed(2)}s 
                        {h.question === longestTimeQuestionText && " (Longest)"}
                     </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Main Quiz Screen Rendering ---
  const currentQNum = currentQuestionIndex + 1;

  // Function to determine the styling for each option button
  const getOptionStyle = (option) => {
    const isSelected = selectedAnswer === option;
    const isCorrect = option === currentQuestion.answer;
    
    // Locked state (after answering/timeout)
    if (isAnswerLocked && feedback) {
      if (isCorrect) {
        return 'bg-green-600 text-white shadow-lg shadow-green-600/50'; // Highlight correct answer
      }
      if (isSelected && feedback === 'wrong') {
        return 'bg-red-600 text-white shadow-lg shadow-red-600/50'; // Highlight wrong selection
      }
      return 'bg-gray-700 text-gray-300 cursor-not-allowed opacity-50'; // Dim unselected
    }

    // Default clickable state
    return 'bg-gray-700 hover:bg-indigo-600 transition duration-200 text-white';
  };
  
  // Timer color
  const timerColor = timer <= 5 ? 'text-red-500' : timer <= 10 ? 'text-yellow-500' : 'text-green-500';


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-lg w-full p-8 bg-gray-800 rounded-xl shadow-2xl">
        
        {/* Header and Progress */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <p className="text-2xl font-bold text-indigo-400">
            Score: {score}
          </p>
          <p className="text-lg font-medium text-gray-300">
            Question {currentQNum} / {totalQuestions}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 mb-6 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <p className={`text-6xl font-black ${timerColor}`}>{timer}</p>
          <p className="text-sm text-gray-400">Seconds Remaining</p>
        </div>

        {/* Question Text */}
        <h2 className="text-xl font-semibold mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswerLocked}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium shadow-md ${getOptionStyle(option)}`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`mt-6 text-center text-xl font-bold p-3 rounded-lg ${
            feedback === 'correct' ? 'bg-green-500 text-white' :
            feedback === 'wrong' ? 'bg-red-500 text-white' :
            'bg-yellow-500 text-gray-900'
          }`}>
            {feedback === 'correct' && '✅ Correct!'}
            {feedback === 'wrong' && '❌ Wrong! Moving to next...'}
            {feedback === 'skipped' && '⏩ Skipped. -1 Point.'}
          </div>
        )}

        {/* Skip Button */}
        <div className="mt-6 flex justify-end">
            <button
                onClick={handleSkipQuestion}
                disabled={isAnswerLocked}
                className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
            >
                Skip Question (-1 pt)
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;