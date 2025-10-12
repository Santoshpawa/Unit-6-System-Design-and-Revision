// Simulated Interface
class IVehicle {
  start() {
    throw new Error("Method 'start()' must be implemented");
  }
}

// Car class implementing IVehicle
class Car extends IVehicle {
  start() {
    console.log("Car is starting");
  }
}

// Bike class implementing IVehicle
class Bike extends IVehicle {
  start() {
    console.log("Bike is starting");
  }
}

// Driver class using IVehicle (Dependency Injection)
class Driver {
  constructor(vehicle) {
    // Loose coupling: Driver depends on IVehicle interface, not specific class
    this.vehicle = vehicle;
  }

  drive() {
    this.vehicle.start();
    console.log("Driving...");
  }
}

// --- Testing ---
const carDriver = new Driver(new Car());
carDriver.drive();

const bikeDriver = new Driver(new Bike());
bikeDriver.drive();
