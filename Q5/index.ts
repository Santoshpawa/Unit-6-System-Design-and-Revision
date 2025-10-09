// 1️⃣ Create an abstraction (interface)
interface Database {
  save(data: string): void;
}

// 2️⃣ Implement MySQL as one possible low-level module
class MySQLService implements Database {
  save(data: string): void {
    console.log("Saving to MySQL:", data);
  }
}

// ✅ You can easily add more databases later
class MongoDBService implements Database {
  save(data: string): void {
    console.log("Saving to MongoDB:", data);
  }
}

// 3️⃣ High-level module depends on abstraction, not concrete class
class UserService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  register(user: string) {
    this.db.save(user);
  }
}

// ✅ 4️⃣ Test with MySQL
const mysqlService = new MySQLService();
const userService1 = new UserService(mysqlService);
userService1.register("Daffy Duck");

// ✅ 5️⃣ Test with MongoDB (no code change in UserService)
const mongoService = new MongoDBService();
const userService2 = new UserService(mongoService);
userService2.register("Donald Duck");
