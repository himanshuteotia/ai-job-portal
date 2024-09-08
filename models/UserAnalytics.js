const mongoose = require("mongoose");

const userAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobCounts: [
    {
      date: String,
      count: Number,
    },
  ],
  techCounts: [
    {
      tech: String,
      count: Number,
    },
  ],
  experienceCounts: [
    {
      experience: String,
      count: Number,
    },
  ],
  techJobCounts: [
    {
      tech: String,
      count: Number,
    },
  ],
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserAnalytics", userAnalyticsSchema);
