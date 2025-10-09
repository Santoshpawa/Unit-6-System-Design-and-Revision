// Define the Strategy Interface
interface FlyStrategy {
  fly(): void;
}

// Concrete Strategy 1
class FastFly implements FlyStrategy {
  fly(): void {
    console.log("Flying fast like a rocket!");
  }
}

// Concrete Strategy 2
class NoFly implements FlyStrategy {
  fly(): void {
    console.log("I cannot fly");
  }
}

// Context Class
class Duck {
  private flyStrategy: FlyStrategy;

  constructor(strategy: FlyStrategy) {
    this.flyStrategy = strategy;
  }

  performFly(): void {
    this.flyStrategy.fly();
  }

  setFlyStrategy(strategy: FlyStrategy): void {
    this.flyStrategy = strategy;
  }
}

// Test
const duck = new Duck(new FastFly());
duck.performFly(); // Flying fast like a rocket!

duck.setFlyStrategy(new NoFly());
duck.performFly(); // I cannot fly
