const express = require("express");
const addTaskController = require("../controllers/task.controller");


const taskRouter = express.Router();

taskRouter.post("/", addTaskController);

module.exports = taskRouter;


// localhost://3000/tesks/