const mongoose = require("mongoose");

const techStatSchema = new mongoose.Schema(
  {
    name: String,
    successRate: Number,
    total: Number,
    success: Number,
  },
  { _id: false }
);

const insightSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, unique: true },
  statusChanges: {
    Pending: {
      "In Process": { type: Number, default: 0 },
      Rejected: { type: Number, default: 0 },
      Success: { type: Number, default: 0 },
    },
  },
  techStats: [techStatSchema],
  suggestions: [String],
});

module.exports = mongoose.model("Insight", insightSchema);
