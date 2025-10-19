/**
 * State Design Pattern Implementation for a Smart Light System
 * This solution addresses scalability and handles user/environmental transitions.
 */

// --- 1. State Interface (Base Class) ---

class LightState {
    /**
     * @param {SmartLight} light - The SmartLight context object.
     */
    getName() {
        throw new Error("This method must be overridden!");
    }

    // User Actions
    turnOff(light) {
        console.log(`[${this.getName()} State] Cannot turn off. Invalid action from this state or already off.`);
    }

    turnOn(light) {
        console.log(`[${this.getName()} State] Cannot turn on. Invalid action from this state or already on.`);
    }

    // Environmental/System Actions
    detectMotion(light, isDaytime) {
        // Default: Ignore motion detection unless in the Off state
    }

    checkDaylight(light, isDaytime) {
        // Default: Ignore daylight check unless in the Motion Detection state
    }
}

// --- 2. Concrete State Classes ---

// State 1: Off State
class OffState extends LightState {
    getName() {
        return "Off";
    }

    turnOn(light) {
        console.log(`[${this.getName()} State] Manual command received. Turning light ON.`);
        // Transition: Off -> On
        light.setState(new OnState());
    }

    detectMotion(light, isDaytime) {
        console.log(`[${this.getName()} State] Motion detected.`);
        // Transition: Off -> Motion Detection
        light.setState(new MotionDetectionState());
        // Immediately check daylight to determine initial brightness
        light.checkDaylight(isDaytime); 
    }
}

// State 2: On State (Manual Override)
class OnState extends LightState {
    getName() {
        return "On (Manual)";
    }

    turnOff(light) {
        console.log(`[${this.getName()} State] Manual command received. Turning light OFF.`);
        // Transition: On -> Off
        light.setState(new OffState());
    }

    // In this state, motion and daylight checks are usually ignored, as manual setting takes priority.
    // If the requirement were to allow brightness adjustment even when manually On, this method would be added here.
}

// State 3: Motion Detection State (Light is ON via motion)
class MotionDetectionState extends LightState {
    getName() {
        return "Motion Detection";
    }

    turnOff(light) {
        console.log(`[${this.getName()} State] Manual command received. Turning light OFF.`);
        // Transition: Motion Detection -> Off
        light.setState(new OffState());
    }

    checkDaylight(light, isDaytime) {
        // Transition: Motion Detection -> Brightness Adjustment
        light.setState(new BrightnessAdjustmentState(isDaytime));
    }
}

// State 4: Brightness Adjustment State (Handles day/night brightness logic)
class BrightnessAdjustmentState extends LightState {
    /**
     * @param {boolean} isDaytime - Indicates if it's currently daytime.
     */
    constructor(isDaytime) {
        super();
        this.isDaytime = isDaytime;
    }

    getName() {
        return "Brightness Adjustment";
    }

    turnOff(light) {
        console.log(`[${this.getName()} State] Manual command received. Turning light OFF.`);
        // Transition: Brightness Adjustment -> Off
        light.setState(new OffState());
    }
    
    // This state completes the logic and can transition back to Motion Detection
    // or remain here until the light times out (logic simplified for this example).
    // For this design, we will log the action and assume it stays in a dynamic ON state.
    
    checkDaylight(light, isDaytime) {
        if (isDaytime) {
            console.log(`[${this.getName()} State] It's DAYTIME. Setting brightness to reduced level.`);
        } else {
            console.log(`[${this.getName()} State] It's NIGHT. Setting brightness to increased level.`);
        }
        // In a real system, the light would remain in Motion Detection State, 
        // with brightness adjusted, but we use a distinct state here as required.
        // For simplicity, we transition back to Motion Detection state after adjustment.
        light.setState(new MotionDetectionState());
    }
}


// --- 3. Context Class ---

class SmartLight {
    /**
     * @type {LightState}
     */
    #state;
    #isDaytime = false; // Environmental condition flag

    constructor() {
        // Initialize with the starting state: Off
        this.#state = new OffState();
        console.log("Smart Light System Initialized.");
    }

    /**
     * Changes the current state of the light.
     * @param {LightState} state - The new state object.
     */
    setState(state) {
        this.#state = state;
        console.log(`*** Light State Transitioned to: ${this.#state.getName()} ***`);
    }

    // Public methods to trigger state changes based on user/system events

    turnOff() { this.#state.turnOff(this); }
    turnOn() { this.#state.turnOn(this); }
    
    /**
     * Simulates motion detection and passes environmental flag.
     */
    motionDetected() { 
        console.log("\n--- EVENT: Motion Detected ---");
        this.#state.detectMotion(this, this.#isDaytime); 
    }
    
    /**
     * Checks daylight condition (Internal/Environmental trigger).
     * This is called by state classes after a motion event.
     */
    checkDaylight(isDaytime) { 
        this.#isDaytime = isDaytime; // Update environment for future checks
        this.#state.checkDaylight(this, isDaytime); 
    }

    getCurrentStateName() {
        return this.#state.getName();
    }
}

// --- 4. Usage Example (Simulation) ---

const smartLight = new SmartLight();

console.log("\n--- Scenario 1: Manual Control ---\n");
// 1. Off -> On (Manual)
smartLight.turnOn(); 
// 2. On -> Off
smartLight.turnOff(); 


console.log("\n--- Scenario 2: Motion Detection (Daytime) ---\n");
smartLight.checkDaylight(true); // Set environment to daytime
console.log(`Current State: ${smartLight.getCurrentStateName()}`);

// 3. Off -> Motion Detection -> Brightness Adjustment (Daytime reduced) -> Motion Detection (Ready)
smartLight.motionDetected(); 


console.log("\n--- Scenario 3: Motion Detection (Nighttime) ---\n");
smartLight.checkDaylight(false); // Set environment to nighttime

// 4. Motion Detection -> Off (Manual override)
smartLight.turnOff(); 

// 5. Off -> Motion Detection -> Brightness Adjustment (Nighttime increased) -> Motion Detection (Ready)
smartLight.motionDetected(); 


console.log(`\nFinal Light State: ${smartLight.getCurrentStateName()}`);