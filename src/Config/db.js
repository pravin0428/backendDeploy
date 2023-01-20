const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
let url = process.env.DB_URL
console.log(url)
const Connect = () => {
  try {
    mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
    console.log("DB connected successfully");
  } catch (err) {
    console.log("Error in connection with DB", err);
  }

  return mongoose.connect(process.env.DB_URL);
};

module.exports = Connect;
