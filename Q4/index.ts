// 1️⃣ Separate interfaces based on specific capabilities
interface Printer {
  print(): void;
}

interface Scanner {
  scan(): void;
}

interface Fax {
  fax(): void;
}

// 2️⃣ OldPrinter implements only what it needs
class OldPrinter implements Printer {
  print(): void {
    console.log("Printing document...");
  }
}

// 3️⃣ SmartPrinter implements all three as needed
class SmartPrinter implements Printer, Scanner, Fax {
  print(): void {
    console.log("Printing document...");
  }

  scan(): void {
    console.log("Scanning document...");
  }

  fax(): void {
    console.log("Sending fax...");
  }
}

// ✅ 4️⃣ Test
const oldPrinter = new OldPrinter();
oldPrinter.print();

const smartPrinter = new SmartPrinter();
smartPrinter.print();
smartPrinter.scan();
smartPrinter.fax();
