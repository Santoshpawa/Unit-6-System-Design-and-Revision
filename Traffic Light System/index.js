
class TrafficLightState {
    /**
     * @param {TrafficLight} context - The TrafficLight object
     */
    handle(context) {
        throw new Error("This method must be overridden!");
    }

    getName() {
        throw new Error("This method must be overridden!");
    }
}

// --- 2. Concrete State Classes ---

class RedLightState extends TrafficLightState {
    getName() {
        return "Red";
    }

    handle(context) {
        console.log(`Current State: ${this.getName()} - Vehicles must stop.`);
        // Transition: Red -> Green
        console.log("Transitioning to Green light.");
        context.setState(new GreenLightState());
    }
}

class GreenLightState extends TrafficLightState {
    getName() {
        return "Green";
    }

    handle(context) {
        console.log(`Current State: ${this.getName()} - Vehicles can move.`);
        // Transition: Green -> Yellow
        console.log("Transitioning to Yellow light.");
        context.setState(new YellowLightState());
    }
}

class YellowLightState extends TrafficLightState {
    getName() {
        return "Yellow";
    }

    handle(context) {
        console.log(`Current State: ${this.getName()} - Vehicles should slow down.`);
        // Transition: Yellow -> Red
        console.log("Transitioning to Red light.");
        context.setState(new RedLightState());
    }
}

// --- 3. Context Class ---

class TrafficLight {
    /**
     * @type {TrafficLightState}
     */
    #state;

    constructor() {
        // Initialize with the starting state, typically Red
        this.#state = new RedLightState();
        console.log("Traffic Light System Initialized.");
    }

    /**
     * Changes the current state of the traffic light.
     * @param {TrafficLightState} state - The new state object.
     */
    setState(state) {
        this.#state = state;
    }

    /**
     * Simulates the change in the traffic light, which triggers a state transition.
     */
    change() {
        console.log("\n--- Light Change Event ---");
        this.#state.handle(this);
    }

    getCurrentStateName() {
        return this.#state.getName();
    }
}

// --- 4. Usage Example ---

// Create the traffic light system
const trafficLight = new TrafficLight();

// Simulate the transitions: Red -> Green -> Yellow -> Red -> Green
console.log("\nSimulating first cycle (Red -> Green -> Yellow -> Red):");

// 1. Red -> Green
trafficLight.change(); 

// 2. Green -> Yellow
trafficLight.change(); 

// 3. Yellow -> Red
trafficLight.change();

console.log("\nSimulating start of second cycle (Red -> Green):");

// 4. Red -> Green
trafficLight.change(); 

console.log("\nFinal State of the Traffic Light:", trafficLight.getCurrentStateName());