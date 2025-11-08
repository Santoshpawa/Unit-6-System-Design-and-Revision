import React, { useState, useCallback, useMemo } from 'react';
import './JokeFetcher.css'; // Assume JokeFetcher.css handles basic styling

// Base URL for the joke API
const API_BASE_URL = 'https://official-joke-api.appspot.com';
const MAX_HISTORY = 5;

// Custom hook to manage the joke history (keeping only the latest 5)
const useJokeHistory = () => {
  const [history, setHistory] = useState([]);

  // Function to add new joke(s) to history, maintaining MAX_HISTORY limit
  const addJokesToHistory = useCallback((newJokes) => {
    setHistory(prevHistory => {
      // Ensure newJokes is an array
      const jokesArray = Array.isArray(newJokes) ? newJokes : [newJokes];
      // Combine new jokes with old, and slice to keep only the last MAX_HISTORY
      return [...prevHistory, ...jokesArray].slice(-MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addJokesToHistory, clearHistory };
};

const JokeFetcher = () => {
  // --- State Management ---
  const [currentJoke, setCurrentJoke] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jokeCount, setJokeCount] = useState(1); // For "Fetch Multiple Jokes"
  const { history, addJokesToHistory, clearHistory } = useJokeHistory();

  // Ref to track the latest fetch ID to prevent race conditions
  const fetchIdRef = React.useRef(0);

  // --- API Fetching Function (Handles both single and multiple fetches) ---
  const fetchJokes = useCallback(async (count = 1) => {
    // 1. Setup for new fetch
    setIsLoading(true);
    setError(null);
    setCurrentJoke(null); // Clear previous joke display
    const currentFetchId = ++fetchIdRef.current; // Increment and use new ID

    // Determine the correct API endpoint
    const endpoint = count > 1 
      ? `${API_BASE_URL}/jokes/ten` // API only supports 10 or 1 for random joke endpoint
      : `${API_BASE_URL}/random_joke`;
      
    try {
      // 2. Fetch data
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // 3. Process and display result (only if this is the latest fetch)
      if (currentFetchId === fetchIdRef.current) {
        // The API returns an array for /jokes/ten and an object for /random_joke
        const fetchedJokes = Array.isArray(data) 
            ? data.slice(0, count) // Use only the requested number of jokes
            : [data];
            
        // The *most recent* joke is the last one in the fetched set
        const latestJoke = fetchedJokes[fetchedJokes.length - 1]; 
        
        setCurrentJoke(latestJoke);
        addJokesToHistory(fetchedJokes);
      }
    } catch (e) {
      // 4. Handle error (only if this is the latest fetch)
      if (currentFetchId === fetchIdRef.current) {
        console.error("Fetch error:", e);
        setError("Failed to fetch joke.");
      }
    } finally {
      // 5. Cleanup
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [addJokesToHistory]);

  // --- Find Longest Joke Setup for Bonus Feature ---
  const longestJokeSetup = useMemo(() => {
    if (history.length === 0) return null;
    
    // Calculate the length of the setup for each joke
    const setups = history.map(joke => ({
      id: joke.id,
      length: joke.setup.length
    }));

    // Find the joke with the maximum setup length
    const longest = setups.reduce((prev, current) => {
      return (prev.length > current.length) ? prev : current;
    });

    return longest.id; // Return the ID of the joke with the longest setup
  }, [history]);

  // --- Event Handlers ---
  const handleSingleFetch = () => fetchJokes(1);
  const handleMultipleFetch = () => {
    // Basic validation for the input
    if (jokeCount >= 1 && jokeCount <= 5) {
      fetchJokes(jokeCount);
    }
  };
  
  // --- Conditional Rendering for Current Joke ---
  const renderCurrentJoke = () => {
    if (isLoading) {
      return <p className="status-message loading">Loading joke...</p>;
    }
    if (error) {
      return <p className="status-message error">{error}</p>;
    }
    if (currentJoke) {
      return (
        <div className="current-joke">
          <p className="setup">**{currentJoke.setup}**</p>
          <p className="punchline">{currentJoke.punchline}</p>
        </div>
      );
    }
    return <p className="status-message">Click the button to get a random joke!</p>;
  };

  // --- Render ---
  return (
    <div className="joke-fetcher-container">
      <h1>Random Joke Generator</h1>

      <div className="control-panel">
        <button 
          onClick={handleSingleFetch} 
          disabled={isLoading}
          className="fetch-button"
        >
          {isLoading ? 'Fetching...' : 'Get Random Joke'}
        </button>

        <div className="multiple-fetch">
          <input
            type="number"
            min="1"
            max="5"
            value={jokeCount}
            onChange={(e) => setJokeCount(Number(e.target.value))}
            disabled={isLoading}
          />
          <button 
            onClick={handleMultipleFetch} 
            disabled={isLoading || jokeCount < 1 || jokeCount > 5}
            className="fetch-multiple-button"
          >
            Fetch {jokeCount} Jokes
          </button>
        </div>
      </div>

      <div className="current-display">
        {renderCurrentJoke()}
      </div>

      {/* --- Joke History --- */}
      <div className="history-section">
        <div className="history-header">
          <h2>Joke History (Last {MAX_HISTORY})</h2>
          <button onClick={clearHistory} disabled={history.length === 0}>
            Clear History
          </button>
        </div>

        {history.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          <ul className="joke-list">
            {/* Reverse the history array to show the newest joke on top */}
            {[...history].reverse().map((joke, index) => (
              <li 
                key={joke.id || index} 
                className={`history-item ${joke.id === longestJokeSetup ? 'longest-setup' : ''}`}
              >
                **{joke.setup}** - {joke.punchline}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JokeFetcher;