const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  suggestions: [String],
  techStats: [
    {
      name: String,
      count: Number,
      successRate: Number,
    },
  ],
  statusChanges: {
    Pending: {
      "In Process": Number,
      Rejected: Number,
    },
    "In Process": {
      Rejected: Number,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Insight", insightSchema);
