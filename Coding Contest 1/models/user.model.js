const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {type:String, required: true, unique: true},
    password: {type:String, required: true},
    role:{type:String, required:true, emun:["member", "admin"]}
});


const userModel = mongoose.model("users", userSchema);

module.exports = userModel;

