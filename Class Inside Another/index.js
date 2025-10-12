// Engine class
class Engine {
  start() {
    console.log("Engine started");
  }
}

// Car class (tightly coupled with Engine)
class Car {
  constructor() {
    // Directly creating Engine instance inside Car → tight coupling
    this.engine = new Engine();
  }

  drive() {
    this.engine.start();
    console.log("Car is driving");
  }
}

// --- Testing ---
const myCar = new Car();
myCar.drive();
