const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  fileType: String,
  subject: String,   
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Content", contentSchema);
