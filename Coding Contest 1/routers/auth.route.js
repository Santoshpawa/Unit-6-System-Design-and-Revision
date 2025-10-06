const express = require("express");
const { signupController, loginController } = require("../controllers/auth.controller");
const authmiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router();

// adding user into database
authRouter.post("/signup",signupController);

authRouter.post("/login", authmiddleware ,loginController);






module.exports = authRouter;