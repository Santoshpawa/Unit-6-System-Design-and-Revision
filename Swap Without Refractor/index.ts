// Interface
interface IEngine {
  start(): void;
}

// Concrete Implementations
class PetrolEngine implements IEngine {
  start(): void {
    console.log("Petrol engine started");
  }
}

class DieselEngine implements IEngine {
  start(): void {
    console.log("Diesel engine started");
  }
}

// Car now depends on the interface, not a specific engine
class Car {
  private engine: IEngine;

  constructor(engine: IEngine) {
    this.engine = engine;
  }

  drive(): void {
    this.engine.start();
    console.log("Driving car");
  }
}

// --- Testing ---
const petrolCar = new Car(new PetrolEngine());
petrolCar.drive();

const dieselCar = new Car(new DieselEngine());
dieselCar.drive();
