const mongoose = require("mongoose");


async function connectToDb(){
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/test");
        console.log("Connected to db");
    } catch (error) {
        console.log("Something went wrong");
    }
}

module.exports = connectToDb;