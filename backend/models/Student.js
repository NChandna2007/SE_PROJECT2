const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  father: String,
  dob: String,
  address: String,
  phone: String
});

module.exports = mongoose.model("Student", studentSchema);
