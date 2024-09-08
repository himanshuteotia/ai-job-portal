const Job = require("../models/Job");
const UserAnalytics = require("../models/UserAnalytics");
const moment = require("moment");

exports.getAnalytics = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    startDate = startDate ? new Date(startDate) : currentMonthStart;
    endDate = endDate ? new Date(endDate) : currentMonthEnd;

    // Check if analytics exist for the given date range
    let analytics = await UserAnalytics.findOne({
      user: req.user._id,
      startDate,
      endDate,
    });

    if (!analytics) {
      // If analytics don't exist, generate them
      const jobs = await Job.find({
        user: req.user._id,
        dateApplied: { $gte: startDate, $lte: endDate },
      }).sort("dateApplied");

      const jobCounts = getJobCounts(jobs);
      const techCounts = getTechCounts(jobs);
      const experienceCounts = getExperienceCounts(jobs);
      const techJobCounts = getTechJobCounts(jobs);

      // Save the analytics
      analytics = new UserAnalytics({
        user: req.user._id,
        jobCounts: Object.entries(jobCounts).map(([date, count]) => ({
          date,
          count,
        })),
        techCounts: Object.entries(techCounts).map(([tech, count]) => ({
          tech,
          count,
        })),
        experienceCounts: Object.entries(experienceCounts).map(
          ([experience, count]) => ({ experience, count })
        ),
        techJobCounts: Object.entries(techJobCounts).map(([tech, count]) => ({
          tech,
          count,
        })),
        startDate,
        endDate,
      });
      await analytics.save();
    }

    // Convert analytics data back to objects for rendering
    const jobCountsObj = Object.fromEntries(
      analytics.jobCounts.map((item) => [item.date, item.count])
    );
    const techCountsObj = Object.fromEntries(
      analytics.techCounts.map((item) => [item.tech, item.count])
    );
    const experienceCountsObj = Object.fromEntries(
      analytics.experienceCounts.map((item) => [item.experience, item.count])
    );
    const techJobCountsObj = Object.fromEntries(
      analytics.techJobCounts.map((item) => [item.tech, item.count])
    );

    // Sort technologies by count
    const sortedTechs = Object.entries(techCountsObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 technologies

    res.render("analytics", {
      jobCounts: jobCountsObj,
      techCounts: Object.fromEntries(sortedTechs),
      experienceCounts: experienceCountsObj,
      techJobCounts: techJobCountsObj,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    res.status(500).render("error", {
      message: "Error fetching analytics: " + error.message,
    });
  }
};

// Helper functions
function getJobCounts(jobs) {
  const counts = {};
  jobs.forEach((job) => {
    const date = moment(job.dateApplied).format("YYYY-MM-DD");
    counts[date] = (counts[date] || 0) + 1;
  });
  return counts;
}

function getTechCounts(jobs) {
  const counts = {};
  jobs.forEach((job) => {
    job.technologies.forEach((tech) => {
      counts[tech] = (counts[tech] || 0) + 1;
    });
  });
  return counts;
}

function getExperienceCounts(jobs) {
  const counts = {};
  jobs.forEach((job) => {
    const exp = job.experienceRequired || "Not Specified";
    counts[exp] = (counts[exp] || 0) + 1;
  });
  return counts;
}

function getTechJobCounts(jobs) {
  const counts = {};
  jobs.forEach((job) => {
    job.technologies.forEach((tech) => {
      counts[tech] = (counts[tech] || 0) + 1;
    });
  });
  return counts;
}
