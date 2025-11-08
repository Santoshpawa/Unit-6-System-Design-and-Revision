import React from 'react';
import AnimatedBanner from './AnimatedBanner';
import './App.css'; // Assume App.css handles the centering

const WORDS = ["Create.", "Learn.", "Grow."];

function App() {
  return (
    <div className="App">
      <AnimatedBanner 
        texts={WORDS} 
        typingSpeed={120} 
        erasingSpeed={50} 
        delayBeforeErase={1500} 
        delayBeforeNext={300} // A slightly faster fade delay
        loop={true}
      />
      <p style={{ marginTop: '20px', fontSize: '1.2em', color: '#7f8c8d' }}>
        A dynamic banner built with React and pure CSS animations.
      </p>
    </div>
  );
}

export default App;