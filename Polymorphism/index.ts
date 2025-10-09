class User {
  public name: string;          // Accessible everywhere
  private orgCode: string = "DuckCorp"; // Accessible only inside this class
  protected role: string;       // Accessible inside this and derived classes

  constructor(name: string, role: string) {
    this.name = name;
    this.role = role;
  }

  introduce(): void {
    console.log(`I am ${this.name} from ${this.orgCode}`);
  }
}

class Manager extends User {
  getRole(): void {
    console.log(this.role);
  }
}

// Test
const user = new User("Daffy", "Employee");
user.introduce(); // I am Daffy from DuckCorp

const manager = new Manager("Donald", "Manager");
manager.introduce(); // I am Donald from DuckCorp
manager.getRole();   // Manager
