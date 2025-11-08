const express = require("express");
const connectToDb = require("./configs/mongo.config");
const taskRouter = require("./routes/task.route");

const app = express();

app.use("/tasks", taskRouter);

connectToDb().then(() => {
  app.listen(3000, () => {
    console.log("listening to port 3000");
  });
});


