const express = require("express");
require("dotenv").config();
const connectToDb = require("./configs/mongo.config");
const authRouter = require("./routers/auth.route");

const app = express();

app.use(express.json());

app.use("/auth",authRouter);


connectToDb().then(()=>{
    app.listen(process.env.ServerPort,()=>{
        console.log("Server started to listen to the port");
    })
})