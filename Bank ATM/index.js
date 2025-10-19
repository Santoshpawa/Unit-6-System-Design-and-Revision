
class ATMState {
    /**
     * @param {ATM} atm - The ATM context object.
     */
    getName() {
        throw new Error("This method must be overridden!");
    }
    
    insertCard(atm) {
        console.log(`[${this.getName()} State] Cannot insert card now.`);
    }

    enterPIN(atm, pin) {
        console.log(`[${this.getName()} State] Cannot enter PIN now.`);
    }

    withdrawCash(atm, amount) {
        console.log(`[${this.getName()} State] Cannot withdraw cash now.`);
    }

    dispenseDone(atm) {
        console.log(`[${this.getName()} State] Nothing to dispense or transaction already complete.`);
    }
}

// --- 2. Concrete State Classes ---

// State: Idle (Waiting for a user)
class IdleState extends ATMState {
    getName() {
        return "Idle";
    }

    insertCard(atm) {
        console.log(`[${this.getName()} State] Card inserted. Waiting for PIN.`);
        // Correct Transition: Idle -> CardInserted
        atm.setState(new CardInsertedState());
    }
}

// State: Card Inserted (Waiting for PIN entry)
class CardInsertedState extends ATMState {
    getName() {
        return "Card Inserted";
    }

    enterPIN(atm, pin) {
        console.log(`[${this.getName()} State] PIN entered: ${pin}.`);
        if (pin === atm.getCorrectPIN()) {
            console.log("PIN verified successfully. Authentication granted.");
            // Correct Transition: CardInserted -> Authenticated
            atm.setState(new AuthenticatedState());
        } else {
            console.log("Invalid PIN. Card ejected. Returning to Idle.");
            // Transition: CardInserted -> Idle (on failure)
            atm.setState(new IdleState());
        }
    }
}

// State: Authenticated (Allowing cash withdrawal)
class AuthenticatedState extends ATMState {
    getName() {
        return "Authenticated";
    }

    withdrawCash(atm, amount) {
        if (amount > 0 && amount <= atm.getCashInATM()) {
            console.log(`[${this.getName()} State] Requesting withdrawal of $${amount}.`);
            atm.setDispensingAmount(amount);
            // Transition: Authenticated -> DispensingCash
            atm.setState(new DispensingCashState());
            // Immediately trigger the dispensing process
            atm.dispenseDone(); 
        } else if (amount > atm.getCashInATM()) {
            console.log(`[${this.getName()} State] Insufficient funds in ATM.`);
            // Remain in Authenticated state, waiting for next command
        } else {
            console.log(`[${this.getName()} State] Invalid withdrawal amount.`);
        }
    }

    // Allow user to cancel/logout and return to Idle
    insertCard(atm) {
        console.log(`[${this.getName()} State] Ejecting card. Returning to Idle.`);
        atm.setState(new IdleState());
    }
}

// State: Dispensing Cash (Dispensing money)
class DispensingCashState extends ATMState {
    getName() {
        return "Dispensing Cash";
    }

    dispenseDone(atm) {
        const amount = atm.getDispensingAmount();
        console.log(`[${this.getName()} State] Dispensing $${amount}.`);
        atm.setCashInATM(atm.getCashInATM() - amount);
        
        // Correct Issue: Must return to Idle after dispensing cash
        console.log("Transaction complete. Ejecting card and returning to Idle.");
        // Correct Transition: DispensingCash -> Idle
        atm.setState(new IdleState());
    }
}

// --- 3. Context Class ---

class ATM {
    /**
     * @type {ATMState}
     */
    #state;
    #cashInATM = 2000;
    #correctPIN = "1234";
    #dispensingAmount = 0;

    constructor() {
        // Start in the Idle state
        this.#state = new IdleState();
        console.log("ATM Initialized. Cash Available: $2000.");
    }

    setState(state) {
        this.#state = state;
        console.log(`*** ATM State Transitioned to: ${this.#state.getName()} ***`);
    }

    // Getters and Setters for context data
    getCorrectPIN() { return this.#correctPIN; }
    getCashInATM() { return this.#cashInATM; }
    setCashInATM(cash) { this.#cashInATM = cash; }
    getDispensingAmount() { return this.#dispensingAmount; }
    setDispensingAmount(amount) { this.#dispensingAmount = amount; }

    // User Actions (Delegated to current state)
    insertCard() { this.#state.insertCard(this); }
    enterPIN(pin) { this.#state.enterPIN(this, pin); }
    withdrawCash(amount) { this.#state.withdrawCash(this, amount); }
    
    // Internal ATM Action (Used by state to trigger final step)
    dispenseDone() { this.#state.dispenseDone(this); }
}

// --- 4. Usage Example (Simulation) ---

const atm = new ATM();
console.log("\n--- Simulation 1: Successful Transaction ---\n");

// 1. Idle -> Card Inserted
atm.insertCard(); 

// 2. Card Inserted -> Authenticated (Correct PIN used)
atm.enterPIN("1234"); 

// 3. Authenticated -> Dispensing Cash (Withdrawal)
const withdrawalAmount = 100;
atm.withdrawCash(withdrawalAmount); 
// 4. Dispensing Cash -> Idle (Automatically triggered)

console.log(`\nCurrent Cash in ATM: $${atm.getCashInATM()}`);
console.log(`Current ATM State: ${atm.getCurrentStateName()}`);


console.log("\n--- Simulation 2: Failed Transaction (Wrong PIN) ---\n");

// 1. Idle -> Card Inserted
atm.insertCard(); 

// 2. Card Inserted -> Idle (Incorrect PIN used)
atm.enterPIN("5678"); 

console.log(`\nFinal ATM State: ${atm.getCurrentStateName()}`);