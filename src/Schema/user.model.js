const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    require: true,
  },
  password: String,
});

const UserModel = model("user", userSchema);

module.exports = UserModel;
