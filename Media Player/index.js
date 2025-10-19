
class PlayerState {
    /**
     * @param {MediaPlayer} player - The MediaPlayer context object.
     */
    play(player) {
        console.log(`[${this.getName()} State] Cannot play. Invalid action from this state.`);
    }

    pause(player) {
        console.log(`[${this.getName()} State] Cannot pause. Invalid action from this state.`);
    }

    stop(player) {
        console.log(`[${this.getName()} State] Cannot stop. Invalid action from this state.`);
    }

    getName() {
        throw new Error("This method must be overridden!");
    }
}

// --- 2. Concrete State Classes ---

// State: Play
class PlayState extends PlayerState {
    getName() {
        return "Playing";
    }

    play(player) {
        console.log(`[${this.getName()} State] Media is already playing.`);
    }

    pause(player) {
        console.log(`[${this.getName()} State] Pausing media.`);
        // Transition: Play -> Pause
        player.setState(new PauseState());
    }

    stop(player) {
        console.log(`[${this.getName()} State] Stopping media.`);
        // Transition: Play -> Stop
        player.setState(new StopState());
    }
}

// State: Pause
class PauseState extends PlayerState {
    getName() {
        return "Paused";
    }

    play(player) {
        console.log(`[${this.getName()} State] Resuming media.`);
        // Transition: Pause -> Play (Resume)
        player.setState(new PlayState());
    }

    pause(player) {
        console.log(`[${this.getName()} State] Media is already paused.`);
    }

    stop(player) {
        console.log(`[${this.getName()} State] Stopping media.`);
        // Transition: Pause -> Stop
        player.setState(new StopState());
    }
}

// State: Stop
class StopState extends PlayerState {
    getName() {
        return "Stopped";
    }

    play(player) {
        console.log(`[${this.getName()} State] Playing media from the beginning.`);
        // Transition: Stop -> Play
        player.setState(new PlayState());
    }

    pause(player) {
        console.log(`[${this.getName()} State] Cannot pause while stopped. Must play first.`);
    }

    stop(player) {
        console.log(`[${this.getName()} State] Media is already stopped.`);
    }
}

// --- 3. Context Class ---

class MediaPlayer {
    /**
     * @type {PlayerState}
     */
    #state;

    constructor() {
        // Initialize with the starting state, typically StopState.
        this.#state = new StopState();
        console.log("Media Player Initialized. Current State: Stopped.");
    }

    /**
     * Changes the current state of the media player.
     * @param {PlayerState} state - The new state object.
     */
    setState(state) {
        this.#state = state;
        console.log(`*** State Transitioned to: ${this.#state.getName()} ***`);
    }

    /**
     * Delegates the 'play' action to the current state.
     */
    play() {
        this.#state.play(this);
    }

    /**
     * Delegates the 'pause' action to the current state.
     */
    pause() {
        this.#state.pause(this);
    }

    /**
     * Delegates the 'stop' action to the current state.
     */
    stop() {
        this.#state.stop(this);
    }

    getCurrentStateName() {
        return this.#state.getName();
    }
}

// --- 4. Usage Example ---

const player = new MediaPlayer();
console.log("\n--- Starting Simulation ---\n");

// 1. Initial State: Stopped -> Play
player.play(); // Transition: Stopped -> Playing

// 2. Playing -> Pause
player.pause(); // Transition: Playing -> Paused

// 3. Pause -> Resume (Play)
player.play(); // Transition: Paused -> Playing

// 4. Playing -> Stop
player.stop(); // Transition: Playing -> Stopped

console.log("\n--- Testing Invalid/Idempotent Actions ---\n");

// 5. Try to pause while stopped (Invalid)
player.pause(); 

// 6. Try to stop while stopped (Idempotent)
player.stop(); 

// 7. Play again (Stopped -> Playing)
player.play();

console.log(`\nFinal Player State: ${player.getCurrentStateName()}`);