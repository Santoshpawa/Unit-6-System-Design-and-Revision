

class VendingMachineState {
    constructor(machine) {
        if (new.target === VendingMachineState) {
            throw new Error("Cannot instantiate abstract class VendingMachineState directly.");
        }
        this.machine = machine;
    }

    insertCoin() {
        throw new Error("Method 'insertCoin()' must be implemented.");
    }

    selectItem() {
        throw new Error("Method 'selectItem()' must be implemented.");
    }

    dispense() {
        throw new Error("Method 'dispense()' must be implemented.");
    }
}

// ---------------------------
// 2. Concrete State Classes
// ---------------------------

class IdleState extends VendingMachineState {
    insertCoin() {
        console.log("Coin inserted. Moving to Processing state.");
        this.machine.setState(this.machine.processingState);
    }

    selectItem() {
        console.log("Error: Please insert a coin first.");
    }

    dispense() {
        console.log("Error: Cannot dispense, machine is Idle.");
    }
}

class ProcessingState extends VendingMachineState {
    insertCoin() {
        console.log("Coin already inserted. Waiting for selection.");
    }

    selectItem() {
        console.log("Selection made. Moving to Dispensing state.");
        this.machine.setState(this.machine.dispensingState);
    }

    dispense() {
        console.log("Error: Cannot dispense, item has not been selected yet.");
    }
}

class DispensingState extends VendingMachineState {
    insertCoin() {
        console.log("Error: Cannot insert coin while dispensing.");
    }

    selectItem() {
        console.log("Error: Selection already made. Dispensing now.");
    }

    dispense() {
        console.log("Dispensing item... finished. Returning to Idle state.");
        // After dispensing, transition back to the Idle state
        this.machine.setState(this.machine.idleState);
    }
}

// ---------------------------
// 3. Context Class (VendingMachine)
// ---------------------------

class VendingMachine {
    constructor() {
        // Initialize all possible state objects
        this.idleState = new IdleState(this);
        this.processingState = new ProcessingState(this);
        this.dispensingState = new DispensingState(this);

        // Set the initial state
        this.currentState = this.idleState;
        console.log(`\n--- Vending Machine Initialized ---`);
        console.log(`Current State: ${this.currentState.constructor.name.replace('State', '')}`);
    }

    setState(newState) {
        this.currentState = newState;
        console.log(`Transitioned to: ${this.currentState.constructor.name.replace('State', '')}`);
    }

    // Public actions that delegate to the current state
    insertCoin() {
        this.currentState.insertCoin();
    }

    selectItem() {
        this.currentState.selectItem();
    }

    dispense() {
        this.currentState.dispense();
    }
}

// ---------------------------
// SIMULATION
// ---------------------------

const machine = new VendingMachine();

console.log(`\n--- Simulation: Successful Purchase ---`);
machine.insertCoin(); // Idle -> Processing
machine.selectItem(); // Processing -> Dispensing
machine.dispense(); // Dispensing -> Idle

console.log(`\n--- Simulation: Invalid Actions ---`);
machine.selectItem(); // Error: Idle state attempt
machine.insertCoin(); // Idle -> Processing
machine.dispense(); // Error: Processing state attempt