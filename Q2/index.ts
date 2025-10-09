
interface ShippingStrategy {
  calculate(): number;
}

class StandardShipping implements ShippingStrategy {
  calculate(): number {
    return 50;
  }
}

class ExpressShipping implements ShippingStrategy {
  calculate(): number {
    return 100;
  }
}

// You can easily add more later — e.g. OvernightShipping
class OvernightShipping implements ShippingStrategy {
  calculate(): number {
    return 150;
  }
}

// 3️⃣ Shipping class depends on abstraction, not concrete logic
class Shipping {
  private strategy: ShippingStrategy;

  constructor(strategy: ShippingStrategy) {
    this.strategy = strategy;
  }

  calculate(): number {
    return this.strategy.calculate();
  }
}


const standard = new Shipping(new StandardShipping());
console.log(standard.calculate()); // 50

const express = new Shipping(new ExpressShipping());
console.log(express.calculate()); // 100

const overnight = new Shipping(new OvernightShipping());
console.log(overnight.calculate()); // 150
