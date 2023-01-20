const express = require("express");
const UserModel = require("../Schema/user.model");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json())
let blacklist = []

const authMiddlewere = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.send("token not found")
  }
  
  try {
    const verification = jwt.verify(token, "SECRET12345");

    if (verification.exp > new Date().getTime()) {
      return res.send("token is expired");
    }

    if (blacklist.includes(token)) {
      return res.send("token already used")
    }
    next()

  } catch (e) {
    return res.send(e.message)
  }
}
app.get("/", async(req,res)=>{
  const user = await UserModel.find()
  res.send(user)
})

//login up start
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email })
  const passs = await argon2.verify(user.password, password)
  try {
    if (passs) {
      const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role },
        "SECRETKEY123",
        {
          expiresIn: "5 mins"
        }
      )
      const refreshToken = jwt.sign({}, "REFRESH", {
        expiresIn: "7 days"
      })
      res.send({ msg: "login sucess", token, refreshToken })
    }
    res.status(401).send("invalid user")
  } catch (e) {
    return res.send(e.message)
  }


})

//sign up start

app.post("/signup", async (req, res) => {
  const { email, password, name, age } = req.body;

  const hash = await argon2.hash(password)
  
  const token = req.headers["authorization"]

  try {

    if (token) {

      const decoded = jwt.decode(token);
    
      if (decoded) {
        if (decoded.role === "HR") {
          const user = new UserModel({ name, email, password: hash, age, role: "Employee" })
          await user.save()
          return res.status(201).send("Employee creation success")
        }
        else {
          return res.status(403).send("You are not allowed")
        }
      }

    }

  }
  catch (e) {
    return res.send(e.message)
  }


 
  const user = new UserModel({ name, email, password: hash, age })
  await user.save()
  return res.status(201).send("Guests creation success")
 

})
module.exports = app;
