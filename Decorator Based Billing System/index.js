// Base Beverage Interface
class Beverage {
  getDescription() {
    return "Unknown Beverage";
  }

  getCost() {
    return 0;
  }
}

// Base Beverages
class Espresso extends Beverage {
  getDescription() {
    return "Espresso";
  }

  getCost() {
    return 80;
  }
}

class LemonTea extends Beverage {
  getDescription() {
    return "LemonTea";
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
const order1 = new Honey(new WhippedCream(new Espresso()));
const order2 = new Sugar(new Sugar(new LemonTea()));

console.log("Order 1:", order1.getDescription()); // Espresso + WhippedCream + Honey
console.log("Cost 1: ₹", order1.getCost());       // 80 + 15 + 20 = ₹115

console.log("Order 2:", order2.getDescription()); // LemonTea + Sugar + Sugar
console.log("Cost 2: ₹", order2.getCost());       // 40 + 10 + 10 = ₹60
