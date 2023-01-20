const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Schema/user.model");

const user = express.Router();
const saltRounds = 5;

user.get("/", async (req, res) => {
  const user = await UserModel.find();
  return res.send(user);
});

user.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      const user = new UserModel({ email, password: hash });
      await user.save();
      return res.send("Sign up successfull");
    });
  }catch(err) {
    return res.status(401).send("Something went wrong");
  }
});

user.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    // console.log(user , "in userRoute")
    if (user) {
      const hashed_password = user.password;
      bcrypt.compare(password, hashed_password, function (err, result) {
        if (result) {
          const token = jwt.sign({ id: user._id, email: user.email }, "abc", {
            expiresIn: "1 day",
          });
          const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            "xyz",
            { expiresIn: "5 days" }
          );
           return res
            .status(200)
            .send({ message: "login success", token, refreshToken });
        }else{
          return res.status(401).send("Login failed");
        }
      });
    }
    else {
      return res.status(404).send("User not found");
    }
  }catch (err) {
    return res.status(400).send("Wrong credentials");
  }
});

module.exports = user;
