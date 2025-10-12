// Step 1: Define the Observer interface
interface Observer {
  update(message: string): void;
}

// Step 2: Implement concrete observers
class Smartphone implements Observer {
  update(message: string): void {
    console.log(`Smartphone received notification: ${message}`);
  }
}

class Tablet implements Observer {
  update(message: string): void {
    console.log(`Tablet received notification: ${message}`);
  }
}

// Step 3: NotificationCenter (Subject)
class NotificationCenter {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
    console.log(`Observer added: ${observer.constructor.name}`);
  }

  detach(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
    console.log(`Observer removed: ${observer.constructor.name}`);
  }

  notify(message: string): void {
    for (const observer of this.observers) {
      observer.update(message);
    }
  }
}

// Step 4: Demo
const notificationCenter = new NotificationCenter();

const phone = new Smartphone();
const tablet = new Tablet();

notificationCenter.attach(phone);   // Observer added: Smartphone
notificationCenter.attach(tablet);  // Observer added: Tablet

notificationCenter.notify("New update available!");

// Output:
// Smartphone received notification: New update available!
// Tablet received notification: New update available!
