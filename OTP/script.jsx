import React, { useState, useRef } from 'react';
import './style.css'; // Import the corresponding CSS file

const NUM_INPUTS = 4;

function OtpInput() {
    // State to hold the 4 digits
    const [otp, setOtp] = useState(new Array(NUM_INPUTS).fill(''));
    
    // Array of refs to manage focus for each input box
    const inputRefs = useRef([]);

    /**
     * Handles the change event for an individual input box.
     * @param {object} e - The event object.
     * @param {number} index - The index of the input box (0 to 3).
     */
    const handleChange = (e, index) => {
        const value = e.target.value;

        // 1. Ignore non-numeric input and multiple characters
        if (isNaN(value) || value.length > 1) {
            return;
        }

        // 2. Update the state array
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // 3. Auto-focus to the next input (if a digit was entered and it's not the last input)
        if (value !== '' && index < NUM_INPUTS - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    /**
     * Handles key down events (specifically Backspace and Arrow keys).
     * @param {object} e - The event object.
     * @param {number} index - The index of the input box (0 to 3).
     */
    const handleKeyDown = (e, index) => {
        // Handle Backspace on an empty field
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            e.preventDefault(); // Prevent default backspace behavior
            
            // Move focus to the previous input
            inputRefs.current[index - 1].focus();

            // Clear the previous input's value for a seamless backspace
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
        
        // Ensure other arrow keys don't mess up the navigation (by default they don't, but this prevents unexpected behavior)
        if (e.key === 'ArrowLeft' && index > 0) {
             inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < NUM_INPUTS - 1) {
             inputRefs.current[index + 1].focus();
        }
    };

    /**
     * Handles the paste event to automatically fill all inputs.
     * @param {object} e - The event object.
     */
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain').trim();

        // Check if the pasted data is a valid 4-digit number
        if (pasteData.length === NUM_INPUTS && /^\d+$/.test(pasteData)) {
            const newOtp = pasteData.split('');
            setOtp(newOtp);

            // Move focus to the last input after pasting
            if (inputRefs.current[NUM_INPUTS - 1]) {
                inputRefs.current[NUM_INPUTS - 1].focus();
            }
        }
    };

    /**
     * Handles the optional submit action.
     */
    const handleSubmit = () => {
        const fullOtp = otp.join('');
        if (fullOtp.length === NUM_INPUTS) {
            console.log('OTP Submitted:', fullOtp);
            alert(`OTP Submitted: ${fullOtp}`);
        } else {
            alert('Please enter a complete 4-digit OTP.');
        }
    };

    const isComplete = otp.every(digit => digit !== '');
    const fullOtpValue = otp.join('');

    return (
        <div className="otp-container">
            <h2>Enter Your OTP</h2>
            <div className="otp-input-group" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        type="tel" // Use 'tel' for better mobile keyboard experience (numeric)
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        // Ref assignment using a callback
                        ref={el => inputRefs.current[index] = el}
                        className="otp-input"
                        autoFocus={index === 0} // Autofocus on the first input on load
                    />
                ))}
            </div>

            <div className="status">
                {isComplete 
                    ? <p className="success">OTP entered: **{fullOtpValue}**</p> 
                    : <p>Waiting for 4 digits...</p>
                }
            </div>

            <button 
                className="submit-btn" 
                onClick={handleSubmit} 
                disabled={!isComplete}
            >
                Submit OTP
            </button>
        </div>
    );
}

export default OtpInput;