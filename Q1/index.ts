// Handles only task-related responsibilities
class TaskService {
  createTask(name: string) {
    console.log(`Creating task: ${name}`);
  }
}

// Handles only email-related responsibilities
class EmailService {
  sendEmail(to: string) {
    console.log(`Sending email to ${to}`);
  }
}

// Coordinator or higher-level class that uses both services
class TaskManager {
  private taskService: TaskService;
  private emailService: EmailService;

  constructor() {
    this.taskService = new TaskService();
    this.emailService = new EmailService();
  }

  createTaskAndNotify(name: string, to: string) {
    this.taskService.createTask(name);
    this.emailService.sendEmail(to);
  }
}

const manager = new TaskManager();
manager.createTaskAndNotify("Complete report", "daffy@duckmail.com");
