// Abstract Class
class Beverage {
  constructor() {
    if (new.target === Beverage) {
      throw new Error("Cannot instantiate abstract class Beverage directly");
    }
  }

  getDescription() {
    throw new Error("getDescription() must be implemented");
  }

  getCost() {
    throw new Error("getCost() must be implemented");
  }
}

// Concrete Beverage
class GreenTea extends Beverage {
  getDescription() {
    return "Green Tea";
  }

  getCost() {
    return 40;
  }
}

// Decorator Base Class
class ToppingDecorator extends Beverage {
  constructor(beverage) {
    super();
    this.beverage = beverage;
  }
}

// Concrete Decorator: Sugar
class Sugar extends ToppingDecorator {
  getDescription() {
    return this.beverage.getDescription() + " + Sugar";
  }

  getCost() {
    return this.beverage.getCost() + 10;
  }
}

// --- Testing ---
const tea = new Sugar(new Sugar(new GreenTea()));

console.log(tea.getDescription()); // Green Tea + Sugar + Sugar
console.log(tea.getCost());        // 40 + 10 + 10 = 60
