const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyName: String,
  jobTitle: String,
  recruiterName: String,
  recruiterEmail: String,
  additionalJobDescription: String,
  salary: String,
  source: String,
  location: String,
  highProbability: Boolean,
  dateApplied: Date,
  jobDescription: String,
  skills: [String],
  experienceRequired: Number,
  status: {
    type: String,
    enum: ["Pending", "In Process", "Rejected", "Success"],
    default: "Pending",
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["Pending", "In Process", "Rejected", "Success"],
      },
      date: { type: Date, default: Date.now },
    },
  ],
  comments: [
    {
      content: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  relatedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  resumePath: String,
  emailSent: { type: Boolean, default: false },
  emailSentDate: Date,
});

module.exports = mongoose.model("Job", jobSchema);
