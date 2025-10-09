// 1️⃣ Strategy Interface
interface PaymentStrategy {
  pay(amount: number): void;
}

// 2️⃣ Concrete Strategies

class CardPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Processing card payment of ₹${amount}`);
  }
}

class UPIPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Processing UPI payment of ₹${amount}`);
  }
}

class BitcoinPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Processing Bitcoin payment of ₹${amount}`);
  }
}

// 3️⃣ Context Class
class Payment {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  process(amount: number): void {
    this.strategy.pay(amount);
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }
}

// 4️⃣ Test

const payment = new Payment(new CardPayment());
payment.process(1000); // Processing card payment of ₹1000

payment.setStrategy(new BitcoinPayment());
payment.process(2000); // Processing Bitcoin payment of ₹2000

payment.setStrategy(new UPIPayment());
payment.process(500); // Processing UPI payment of ₹500
