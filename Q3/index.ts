// 1️⃣ Define a general Bird base class
class Bird {
  eat(): void {
    console.log("Eating...");
  }
}

// 2️⃣ Define a Flyable interface (only for birds that can fly)
interface Flyable {
  fly(): void;
}

// 3️⃣ Specific bird types
class Sparrow extends Bird implements Flyable {
  fly(): void {
    console.log("Sparrow is flying...");
  }
}

class Ostrich extends Bird {
  walk(): void {
    console.log("Ostrich is walking...");
  }
}

// ✅ 4️⃣ Test
const sparrow = new Sparrow();
sparrow.fly(); // Sparrow is flying...

const ostrich = new Ostrich();
ostrich.walk(); // Ostrich is walking...
