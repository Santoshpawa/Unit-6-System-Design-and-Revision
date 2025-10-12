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

// Concrete Subclass
class GreenTea extends Beverage {
  getDescription() {
    return "Green Tea";
  }

  getCost() {
    return 40;
  }
}

// --- Testing ---
const tea = new GreenTea();
console.log(tea.getDescription()); // Green Tea
console.log(tea.getCost());        // 40
