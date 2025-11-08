import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedBanner.css'; // Assume AnimatedBanner.css handles the cursor and fade

// Define the phases of the animation
const PHASES = {
  TYPING: 'typing',
  PAUSING: 'pausing',
  ERASING: 'erasing',
  FADING_OUT: 'fading_out',
  FADING_IN: 'fading_in',
};

// Component props interface
/**
 * @typedef {object} AnimatedBannerProps
 * @property {string[]} texts - List of phrases to display.
 * @property {number} [typingSpeed=120] - Speed of typing per character in ms.
 * @property {number} [erasingSpeed=60] - Speed of erasing per character in ms.
 * @property {number} [delayBeforeErase=1000] - Delay before starting to erase.
 * @property {number} [delayBeforeNext=500] - Delay before starting to type the next word.
 * @property {boolean} [loop=true] - If true, continuously loop through all words.
 */

/**
 * @param {AnimatedBannerProps} props
 */
const AnimatedBanner = ({
  texts,
  typingSpeed = 120,
  erasingSpeed = 60,
  delayBeforeErase = 1000,
  delayBeforeNext = 500,
  loop = true,
}) => {
  // --- State Hooks ---
  const [currentText, setCurrentText] = useState(''); // The text currently visible
  const [textIndex, setTextIndex] = useState(0); // Index of the word in the 'texts' array
  const [charIndex, setCharIndex] = useState(0); // Index of the character within the current word
  const [phase, setPhase] = useState(PHASES.TYPING); // Current animation state
  const [isFading, setIsFading] = useState(false); // Controls the CSS fade class

  // --- Ref for cleanup ---
  const timeoutRef = useRef(null);

  // --- Helper to clear the timer ---
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // --- Main Animation Logic (useEffect) ---
  useEffect(() => {
    const currentWord = texts[textIndex];
    let speed = 0;
    
    clearTimer(); // Clear any existing timer before setting a new one

    // 1. TYPING PHASE
    if (phase === PHASES.TYPING) {
      if (charIndex < currentWord.length) {
        speed = typingSpeed;
        timeoutRef.current = setTimeout(() => {
          setCurrentText(currentWord.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        }, speed);
      } else {
        // Word is fully typed, move to PAUSING
        setPhase(PHASES.PAUSING);
      }
    } 
    
    // 2. PAUSING PHASE
    else if (phase === PHASES.PAUSING) {
      speed = delayBeforeErase;
      timeoutRef.current = setTimeout(() => {
        setPhase(PHASES.ERASING);
      }, speed);
    } 
    
    // 3. ERASING PHASE
    else if (phase === PHASES.ERASING) {
      if (charIndex > 0) {
        speed = erasingSpeed;
        timeoutRef.current = setTimeout(() => {
          setCurrentText(currentWord.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        }, speed);
      } else {
        // Word is fully erased, move to FADING_OUT
        setPhase(PHASES.FADING_OUT);
      }
    } 
    
    // 4. FADING_OUT PHASE (Start CSS fade-out)
    else if (phase === PHASES.FADING_OUT) {
      setIsFading(true); // Trigger CSS fade-out
      speed = 300; // Time for the fade-out CSS transition
      timeoutRef.current = setTimeout(() => {
        // Check for loop condition and update textIndex
        let nextIndex = (textIndex + 1) % texts.length;
        if (!loop && nextIndex === 0) {
            // If not looping and we've finished the last word, stop.
            setPhase(null); // Stop the animation logic
            return;
        }

        // Prepare for the next word
        setTextIndex(nextIndex);
        setPhase(PHASES.FADING_IN);
      }, speed);
    } 
    
    // 5. FADING_IN PHASE (Wait, then start typing)
    else if (phase === PHASES.FADING_IN) {
        // Wait before starting to type the new word
        speed = delayBeforeNext;
        timeoutRef.current = setTimeout(() => {
            setIsFading(false); // Turn off CSS fade (fade-in is implicit by removing the class)
            setCharIndex(0);
            setPhase(PHASES.TYPING);
        }, speed);
    }

    // Cleanup function: Clear the timer when the component unmounts or dependencies change
    return () => clearTimer();
  }, [
    phase,
    charIndex,
    textIndex,
    texts,
    typingSpeed,
    erasingSpeed,
    delayBeforeErase,
    delayBeforeNext,
    loop,
    clearTimer
  ]);

  // --- Render ---
  return (
    <h1 
      className={`animated-banner ${isFading ? 'fade-out' : 'fade-in'}`}
      // Accessibility: aria-live region announces text changes to screen readers
      aria-live="polite" 
      aria-atomic="true"
    >
      <span className="banner-text">
        {currentText}
      </span>
      {/* The cursor is only visible during typing/erasing/pausing */}
      {phase !== null && (
        <span className="cursor" aria-hidden="true">
          |
        </span>
      )}
    </h1>
  );
};

export default AnimatedBanner;