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
    let insight = await Insight.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });

    if (!insight || moment().diff(insight.createdAt, "hours") >= 24) {
      const jobs = await Job.find({ user: req.user._id }).sort({
        dateApplied: -1,
      });

      const techStats = analyzeTechnologies(jobs);
      const statusChanges = analyzeStatusChanges(jobs);
      const suggestions = generateSuggestions(techStats, statusChanges);

      insight = new Insight({
        user: req.user._id,
        suggestions,
        techStats,
        statusChanges,
      });
      await insight.save();
    }

    res.render("insights", insight);
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
