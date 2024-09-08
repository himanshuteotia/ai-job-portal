const Job = require("../models/Job");
const Note = require("../models/Note");
const {
  mockAITechnologyExtraction,
  mockAIExperienceExtraction,
} = require("../utils/mockAI");

exports.getJobs = async (req, res) => {
  try {
    const { status, company } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (company) {
      query.companyName = { $regex: company, $options: "i" };
    }

    const jobs = await Job.find(query).sort({ dateApplied: -1 });
    const notes = await Note.find({ user: req.user._id });

    const jobsWithNotes = jobs.map((job) => ({
      ...job.toObject(),
      notes: notes.filter(
        (note) => note.job && note.job.toString() === job._id.toString()
      ),
    }));

    res.render("index", { jobs: jobsWithNotes, filters: { status, company } });
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching jobs" });
  }
};

exports.getAddJobForm = (req, res) => {
  res.render("add");
};

exports.addJob = async (req, res) => {
  try {
    const { companyName, dateApplied, jobDescription } = req.body;

    // If you want to use AI extraction, uncomment these lines
    // const technologies = mockAITechnologyExtraction(jobDescription);
    // const experienceRequired = mockAIExperienceExtraction(jobDescription);

    // For now, let's use default values
    const technologies = [];
    const experienceRequired = 0;

    const newJob = new Job({
      user: req.user._id,
      companyName,
      dateApplied,
      jobDescription,
      technologies,
      experienceRequired,
    });

    await newJob.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).render("error", { message: "Error adding job", error });
  }
};

exports.linkNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteIds } = req.body;

    console.log(`Linking notes to job ${id}:`, noteIds);

    const job = await Job.findById(id);
    if (!job) {
      console.log(`Job not found: ${id}`);
      return res.status(404).json({ message: "Job not found" });
    }

    // Ensure job.notes is an array
    if (!Array.isArray(job.notes)) {
      job.notes = [];
    }

    // Add new note IDs, avoiding duplicates
    job.notes = [...new Set([...job.notes, ...noteIds])];
    await job.save();

    const updatedJob = await Job.findById(id).populate("notes");
    console.log(`Updated job:`, updatedJob);
    res.json(updatedJob);
  } catch (error) {
    console.error("Error linking notes:", error);
    res
      .status(500)
      .json({ message: "Error linking notes", error: error.message });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("relatedNotes");
    if (!job) {
      return res.status(404).render("error", { message: "Job not found" });
    }
    res.render("jobDetails", { job });
  } catch (error) {
    console.error("Error in getJobDetails:", error);
    res.status(500).render("error", { message: "Error fetching job details" });
  }
};
