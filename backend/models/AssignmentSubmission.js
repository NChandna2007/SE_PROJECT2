const mongoose = require("mongoose");

const AssignmentSubmissionSchema = new mongoose.Schema({
  assignmentName: {
    type: String,
    required: true
  },

  // ✅ FIX: STRING instead of ObjectId
  studentId: {
    type: String,
    required: true
  },

  studentName: {
    type: String,
    required: true
  },

  filePath: {
    type: String,
    required: true
  },

  marks: {
    type: Number,
    default: null
  },

  feedback: {
    type: String,
    default: ""
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
