// Base class
class Animal {
  makeSound(): void {
    console.log("Some sound");
  }
}

// Derived class
class Dog extends Animal {
  makeSound(): void {
    console.log("Bark!");
  }
}

// Polymorphic function
function makeAnimalSound(animal: Animal) {
  animal.makeSound();
}

// Test

const genericAnimal = new Animal();
const dog = new Dog();

makeAnimalSound(genericAnimal); // Some sound
makeAnimalSound(dog);           // Bark!
