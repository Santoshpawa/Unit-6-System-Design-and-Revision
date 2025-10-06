const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
require("dotenv").config();

// adding user at signup
async function signupController(req, res) {
  try {
    let { email, password, role } = req.body;

    bcrypt.hash(password, saltRounds, async function (err, hash) {
      await userModel.create({ email, password: hash, role });
    });

    res.json({ msg: "User succesfully signed In." });
  } catch (error) {
    res.json({ msg: "Something went wrong." });
    console.log(error);
  }
}

// login and generation jwt
async function loginController(req, res) {
  try {
    let userId = req.user;
    let role = req.role;
    var token = jwt.sign({ userId, role }, process.env.SecretKey);
    res.json({ msg: "User login successfully", token });
  } catch (error) {
    res.json({ msg: "Something went wrong." });
  }
}

module.exports = { signupController, loginController };
