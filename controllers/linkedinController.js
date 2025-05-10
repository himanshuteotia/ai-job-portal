const Job = require("../models/Job");
const axios = require("axios");
const cheerio = require("cheerio");

exports.getLinkedInJobsPage = (req, res) => {
  res.render("linkedinJobs");
};

exports.extractJobs = async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid LinkedIn job URLs",
      });
    }

    const jobs = await Promise.all(urls.map(extractJobDetails));

    res.json({
      success: true,
      jobs: jobs.filter((job) => job !== null), // Remove any failed extractions
    });
  } catch (error) {
    console.error("Error extracting jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error extracting job details",
      error: error.message,
    });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const jobDetails = await extractJobDetails(jobId);

    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        message: "Could not fetch job details",
      });
    }

    const job = new Job({
      user: req.user._id,
      jobTitle: jobDetails.title,
      companyName: jobDetails.company,
      location: jobDetails.location,
      jobType: jobDetails.type,
      jobDescription: jobDetails.description,
      applicationLink: jobDetails.url,
      source: "LinkedIn",
      status: "Pending",
      dateApplied: new Date(),
    });

    await job.save();

    res.json({
      success: true,
      message: "Job saved successfully",
      job,
    });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({
      success: false,
      message: "Error saving job",
      error: error.message,
    });
  }
};

async function extractJobDetails(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Note: This is a basic implementation. LinkedIn's actual structure might be different
    // and might require more sophisticated scraping techniques
    return {
      id: url,
      title: $(".job-title").text().trim(),
      company: $(".company-name").text().trim(),
      location: $(".job-location").text().trim(),
      type: $(".job-type").text().trim(),
      description: $(".job-description").text().trim(),
      url: url,
    };
  } catch (error) {
    console.error(`Error extracting details from ${url}:`, error);
    return null;
  }
}
