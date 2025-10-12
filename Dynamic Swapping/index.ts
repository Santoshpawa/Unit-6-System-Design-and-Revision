// Interface Simulation
class Vehicle {
  start() {
    throw new Error("Method 'start()' must be implemented");
  }
}

// Concrete Implementations
class Bike extends Vehicle {
  start() {
    console.log("Bike is starting");
  }
}

class Car extends Vehicle {
  start() {
    console.log("Car is starting");
  }
}

// Driver class using the Vehicle interface
class Driver {
  constructor(vehicle) {
    this.vehicle = vehicle; // initial strategy
  }

  drive() {
    this.vehicle.start();
    console.log("Driving...");
  }

  setVehicle(vehicle) {
    this.vehicle = vehicle; // switch strategy at runtime
  }
}

// --- Testing ---
const driver = new Driver(new Bike());
driver.drive(); // Bike is starting → Driving...

driver.setVehicle(new Car());
driver.drive(); // Car is starting → Driving...
