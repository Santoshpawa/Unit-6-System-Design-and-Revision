const taskModel = require("../models/task.model");


async function addTaskController(req,res){
    try {
        await taskModel.create(req.body);
        res.json({msg : "task added successfully"});
    } catch (error) {
        res.json({msg : "Something went wrong"})
    }
}

module.exports = addTaskController;



