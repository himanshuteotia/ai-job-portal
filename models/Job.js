const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyName: String,
  dateApplied: Date,
  jobDescription: String,
  technologies: [String],
  experienceRequired: Number,
  status: {
    type: String,
    enum: ["Pending", "In Process", "Rejected"],
    default: "Pending",
  },
  comments: [
    {
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
  ],
  relatedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
});

module.exports = mongoose.model("Job", jobSchema);
