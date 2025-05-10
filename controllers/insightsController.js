const Job = require("../models/Job");
const Insight = require("../models/Insight");
const moment = require("moment");
const {
  analyzeTechnologies,
  analyzeStatusChanges,
  generateSuggestions,
} = require("../utils/insightHelpers");

exports.getInsights = async (req, res) => {
  try {
    // Fetch all insights, sorted by date desc
    const insights = await Insight.find({}).sort({ date: -1 });
    res.render("insights", { insights });
  } catch (error) {
    res.status(500).render("error", { message: "Error generating insights" });
  }
};

exports.regenerateInsights = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({
      dateApplied: -1,
    });

    const techStats = analyzeTechnologies(jobs);
    const statusChanges = analyzeStatusChanges(jobs);
    const suggestions = generateSuggestions(techStats, statusChanges);

    const newInsight = new Insight({
      user: req.user._id,
      suggestions,
      techStats,
      statusChanges,
    });
    await newInsight.save();

    res.redirect("/insights");
  } catch (error) {
    res.status(500).render("error", { message: "Error regenerating insights" });
  }
};

// Helper to calculate and save daily insights (for cron job or manual trigger)
exports.calculateAndSaveInsights = async function () {
  const Job = require("../models/Job");
  const Insight = require("../models/Insight");
  const {
    analyzeTechnologies,
    analyzeStatusChanges,
    generateSuggestions,
  } = require("../utils/insightHelpers");

  const jobs = await Job.find({});
  const techStats = analyzeTechnologies(jobs);
  const statusChanges = analyzeStatusChanges(jobs);
  const suggestions = generateSuggestions(techStats, statusChanges);

  const insight = new Insight({
    date: new Date(),
    suggestions,
    techStats,
    statusChanges,
  });
  await insight.save();
  return insight;
};
