
// --- Constants ---
const MAX_CAPACITY = 8;
const MAX_FLOORS = 10;
const MOVEMENT_DELAY_MS = 1000; // 1 second per floor movement
const DOOR_DELAY_MS = 2000;    // 2 seconds for doors to open/close

// --- State Definitions ---
const ElevatorState = {
    MOVING: 'Moving',
    OPEN_DOOR: 'OpenDoor',
    CLOSE_DOOR: 'CloseDoor',
    IDLE: 'Idle'
};

const Direction = {
    UP: 'Up',
    DOWN: 'Down',
    NONE: 'None'
};

// --- Elevator Class ---
class Elevator {
    /**
     * @param {number} id - Unique ID for the elevator.
     */
    constructor(id) {
        this.id = id;
        this.currentFloor = 1;
        this.state = ElevatorState.IDLE;
        this.direction = Direction.NONE;
        this.occupancy = 0; // People count
        // Floors requested from inside the elevator (destination calls)
        this.destinationQueue = new Set(); 
        // Floors requested from outside the elevator (external calls)
        this.externalRequests = new Map(); // Map: { floor: Direction }
        this.isMoving = false; // Flag to prevent concurrent movement loops
        console.log(`Elevator ${this.id} initialized at Floor ${this.currentFloor}.`);
    }

    /**
     * Changes the state and updates the display.
     * @param {string} newState 
     */
    setState(newState) {
        this.state = newState;
        // In a real app, this would trigger a UI update event.
        // For simplicity, we just log and rely on the controller for updates.
        // console.log(`Elevator ${this.id} state changed to: ${this.state}`);
    }

    /**
     * Adds an internal request (passenger pressing a floor button).
     * @param {number} floor - The desired destination floor.
     */
    addDestination(floor) {
        if (floor >= 1 && floor <= MAX_FLOORS) {
            this.destinationQueue.add(floor);
            this.updateDirection();
            this.processRequests();
            return true;
        }
        return false;
    }

    /**
     * Adds an external request (call button on a floor).
     * @param {number} floor - The floor the call originated from.
     * @param {string} direction - Direction requested (Up/Down).
     */
    addExternalRequest(floor, direction) {
        if (floor >= 1 && floor <= MAX_FLOORS) {
            this.externalRequests.set(floor, direction);
            this.updateDirection();
            this.processRequests();
            return true;
        }
        return false;
    }

    /**
     * Determines the next best direction based on current floor and queue.
     */
    updateDirection() {
        const allRequests = Array.from(this.destinationQueue).concat(Array.from(this.externalRequests.keys()));

        if (allRequests.length === 0) {
            this.direction = Direction.NONE;
            return;
        }

        const nextStop = this.findNextStop();

        if (nextStop === null) {
            this.direction = Direction.NONE;
        } else if (nextStop > this.currentFloor) {
            this.direction = Direction.UP;
        } else if (nextStop < this.currentFloor) {
            this.direction = Direction.DOWN;
        } else {
            this.direction = Direction.NONE;
        }
    }

    /**
     * Finds the next floor to stop at, prioritizing requests in the current direction.
     * @returns {number | null} - The next floor number.
     */
    findNextStop() {
        const allRequests = Array.from(this.destinationQueue).concat(Array.from(this.externalRequests.keys()));
        if (allRequests.length === 0) return null;

        // Filter requests in the current direction (priority)
        let primaryRequests = [];
        if (this.direction === Direction.UP) {
            primaryRequests = allRequests.filter(f => f >= this.currentFloor);
            if (primaryRequests.length > 0) return Math.min(...primaryRequests);
        } else if (this.direction === Direction.DOWN) {
            primaryRequests = allRequests.filter(f => f <= this.currentFloor);
            if (primaryRequests.length > 0) return Math.max(...primaryRequests);
        }

        // If no requests in current direction, find the closest request regardless of direction
        if (allRequests.length > 0) {
            let closest = allRequests.reduce((prev, curr) => 
                Math.abs(curr - this.currentFloor) < Math.abs(prev - this.currentFloor) ? curr : prev
            );
            return closest;
        }

        return null;
    }

    /**
     * The main loop for handling movement and stops.
     */
    async processRequests() {
        if (this.isMoving) return;
        
        while (this.destinationQueue.size > 0 || this.externalRequests.size > 0) {
            if (this.state === ElevatorState.IDLE || this.state === ElevatorState.CLOSE_DOOR) {
                this.isMoving = true;
                this.updateDirection();
            }

            if (this.direction === Direction.NONE) {
                this.isMoving = false;
                this.setState(ElevatorState.IDLE);
                break;
            }

            this.setState(ElevatorState.MOVING);
            await this.moveOneFloor();

            if (this.shouldStopAtCurrentFloor()) {
                await this.stopAndOpenDoor();
            }

            // After stopping, re-evaluate direction for remaining requests
            this.updateDirection(); 
        }

        this.isMoving = false;
        this.setState(ElevatorState.IDLE);
        this.direction = Direction.NONE;
    }

    /**
     * Checks if the elevator needs to stop at the current floor.
     */
    shouldStopAtCurrentFloor() {
        // Internal destination request
        if (this.destinationQueue.has(this.currentFloor)) return true;
        
        // External request in the current direction (prioritization)
        const requestedDir = this.externalRequests.get(this.currentFloor);
        if (requestedDir) {
            // Stop if the elevator is Idle, or if the direction matches the request
            if (this.direction === Direction.NONE || requestedDir === this.direction) {
                return true;
            }
        }
        return false;
    }

    /**
     * Simulates movement to the next floor.
     */
    moveOneFloor() {
        return new Promise(resolve => {
            setTimeout(() => {
                if (this.direction === Direction.UP && this.currentFloor < MAX_FLOORS) {
                    this.currentFloor++;
                } else if (this.direction === Direction.DOWN && this.currentFloor > 1) {
                    this.currentFloor--;
                }
                
                // If we hit the end of the building, flip direction to process remaining calls
                if (this.currentFloor === MAX_FLOORS || this.currentFloor === 1) {
                    this.direction = (this.direction === Direction.UP) ? Direction.DOWN : Direction.UP;
                }
                
                resolve();
            }, MOVEMENT_DELAY_MS);
        });
    }

    /**
     * Simulates stopping, opening, and closing doors.
     */
    async stopAndOpenDoor() {
        // 1. Open Door
        this.setState(ElevatorState.OPEN_DOOR);
        this.destinationQueue.delete(this.currentFloor); // Passenger exit/entered and pressed button
        this.externalRequests.delete(this.currentFloor); // External call served
        console.log(`Elevator ${this.id} STOPPED at Floor ${this.currentFloor}. Doors OPEN.`);

        // Simulate people entering/exiting and door delay
        await new Promise(resolve => setTimeout(resolve, DOOR_DELAY_MS));

        // 2. Close Door
        this.setState(ElevatorState.CLOSE_DOOR);
        console.log(`Elevator ${this.id} Doors CLOSED. Resume movement.`);
        await new Promise(resolve => setTimeout(resolve, DOOR_DELAY_MS / 2));
    }
}

// --- Elevator Controller Class ---
class ElevatorController {
    /**
     * @param {number} numElevators - Number of elevators to manage.
     * @param {number} maxFloors - Total number of floors in the building.
     */
    constructor(numElevators, maxFloors) {
        this.elevators = Array.from({ length: numElevators }, (_, i) => new Elevator(i + 1));
        this.maxFloors = maxFloors;
        this.requestQueue = []; // { floor: number, direction: string }
    }

    /**
     * Receives an external request from a floor (Up or Down button press).
     * @param {number} floor - The floor making the request.
     * @param {string} direction - Direction requested (Up or Down).
     */
    handleExternalRequest(floor, direction) {
        if (floor < 1 || floor > this.maxFloors || !Object.values(Direction).includes(direction)) {
            console.error("Invalid floor or direction for external request.");
            return;
        }

        // Basic deduplication for current implementation
        if (this.requestQueue.some(r => r.floor === floor && r.direction === direction)) {
             console.log(`Request from Floor ${floor} ${direction} already queued or being served.`);
             return;
        }

        // Find the best elevator
        const bestElevator = this.findBestElevator(floor, direction);
        if (bestElevator) {
            console.log(`ASSIGNING: Floor ${floor} (${direction}) to Elevator ${bestElevator.id}`);
            bestElevator.addExternalRequest(floor, direction);
        } else {
             // If no elevator is immediately available, queue it for later (simplified)
            this.requestQueue.push({ floor, direction });
            console.log(`QUEUED: Floor ${floor} (${direction}). No immediate assignment.`);
        }
    }

    /**
     * Heuristic to find the best elevator to service a request.
     * @param {number} targetFloor - The floor where the request originated.
     * @param {string} requestedDirection - The direction requested by the passenger.
     * @returns {Elevator | null} The best elevator instance.
     */
    findBestElevator(targetFloor, requestedDirection) {
        let bestElevator = null;
        let minCost = Infinity;

        for (const elevator of this.elevators) {
            const cost = this.calculateCost(elevator, targetFloor, requestedDirection);
            
            if (cost < minCost) {
                minCost = cost;
                bestElevator = elevator;
            }
        }
        return bestElevator;
    }

    /**
     * Calculates the "cost" (priority/distance) of an elevator fulfilling a request.
     * Prioritization logic:
     * 1. Idle elevators are preferred (lowest cost).
     * 2. Elevators moving in the desired direction and already passed the target are ignored (high cost).
     * 3. Elevators moving toward the target in the correct direction are preferred.
     * @param {Elevator} elevator 
     * @param {number} targetFloor 
     * @param {string} requestedDirection 
     * @returns {number} Cost value (lower is better).
     */
    calculateCost(elevator, targetFloor, requestedDirection) {
        const currentFloor = elevator.currentFloor;
        const currentDirection = elevator.direction;
        const distance = Math.abs(currentFloor - targetFloor);

        // 1. Idle is best
        if (currentDirection === Direction.NONE) {
            return distance * 1; 
        }

        // 2. Elevator is already moving in the requested direction
        if (currentDirection === requestedDirection) {
            if (requestedDirection === Direction.UP && targetFloor >= currentFloor) {
                // Moving up, target is ahead: acceptable cost
                return distance * 0.5; // High priority
            }
            if (requestedDirection === Direction.DOWN && targetFloor <= currentFloor) {
                // Moving down, target is ahead: acceptable cost
                return distance * 0.5; // High priority
            }
        }

        // 3. Elevator is moving in the opposite direction or past the target: High penalty
        if (
            (currentDirection === Direction.UP && targetFloor < currentFloor) ||
            (currentDirection === Direction.DOWN && targetFloor > currentFloor)
        ) {
            // Calculate distance to turn around (to the end of its current route + distance back)
            return (this.maxFloors + distance) * 10; 
        }

        // Default cost (if moving but not in a highly prioritized way)
        return distance * 5; 
    }

    /**
     * Retrieves status for all elevators for UI display.
     */
    getSystemStatus() {
        return this.elevators.map(e => ({
            id: e.id,
            floor: e.currentFloor,
            state: e.state,
            direction: e.direction,
            occupancy: e.occupancy,
            destinations: Array.from(e.destinationQueue),
            external: Array.from(e.externalRequests.keys())
        }));
    }
}
