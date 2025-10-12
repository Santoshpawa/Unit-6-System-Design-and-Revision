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

// Base Beverages
class Coffee extends Beverage {
  getDescription() {
    return "Coffee";
  }

  getCost() {
    return 50;
  }
}

// Decorator Base Class
class ToppingDecorator extends Beverage {
  constructor(beverage) {
    super();
    this.beverage = beverage;
  }
}

// Concrete Toppings
class Sugar extends ToppingDecorator {
  getDescription() {
    return this.beverage.getDescription() + " + Sugar";
  }

  getCost() {
    return this.beverage.getCost() + 10;
  }
}

class Honey extends ToppingDecorator {
  getDescription() {
    return this.beverage.getDescription() + " + Honey";
  }

  getCost() {
    return this.beverage.getCost() + 20;
  }
}

class WhippedCream extends ToppingDecorator {
  getDescription() {
    return this.beverage.getDescription() + " + WhippedCream";
  }

  getCost() {
    return this.beverage.getCost() + 15;
  }
}

// --- Testing ---
const myDrink = new WhippedCream(new Honey(new Sugar(new Coffee())));

console.log(myDrink.getDescription()); // Coffee + Sugar + Honey + WhippedCream
console.log(myDrink.getCost());        // 50 + 10 + 20 + 15 = 95
