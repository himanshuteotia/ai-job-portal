const mongoose = require("mongoose");
const Job = require("../models/Job");
const Note = require("../models/Note");
const {
  mockAITechnologyExtraction,
  mockAIExperienceExtraction,
} = require("../utils/mockAI");
const Skill = require("../models/Skill");

exports.getJobs = async (req, res) => {
  try {
    const { status, company, skill, page = 1, limit = 10 } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (company) {
      query.companyName = { $regex: company, $options: "i" };
    }

    if (skill) {
      query.skills = skill;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
      .sort({ dateApplied: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const totalJobs = await Job.countDocuments(query);
    const notes = await Note.find({ user: req.user._id });

    // Fetch comments for each job
    const jobsWithNotesAndComments = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        jobObj.notes = notes.filter(
          (note) => note.job && note.job.toString() === job._id.toString()
        );
        // Comments array
        jobObj.comments = job.comments || [];
        return jobObj;
      })
    );

    // Get all skills from Skill collection
    const allSkillsDocs = await Skill.find({ verified: true }).sort("name");
    const allSkills = allSkillsDocs.map((s) => s.name);

    res.render("index", {
      jobs: jobsWithNotesAndComments,
      filters: { status, company, skill },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
      },
      allSkills,
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching jobs" });
  }
};

exports.getAddJobForm = async (req, res) => {
  // Fetch all skills for job creation form
  const allSkillsDocs = await Skill.find({ verified: true }).sort("name");
  const allSkills = allSkillsDocs.map((s) => s.name);
  res.render("add", { allSkills });
};

exports.addJob = async (req, res) => {
  try {
    const {
      companyName,
      dateApplied,
      jobDescription,
      skills,
      jobTitle,
      salary,
      source,
      location,
      highProbability,
      recruiterName,
      recruiterEmail,
      additionalJobDescription,
    } = req.body;

    let skillsArr = [];
    if (Array.isArray(skills)) {
      skillsArr = skills;
    } else if (typeof skills === "string" && skills.length > 0) {
      skillsArr = [skills];
    }

    const experienceRequired = 0;

    const newJob = new Job({
      user: req.user._id,
      companyName,
      dateApplied,
      jobDescription,
      skills: skillsArr,
      experienceRequired,
      jobTitle,
      salary,
      source,
      location,
      highProbability:
        highProbability === "on" ||
        highProbability === true ||
        highProbability === "true",
      recruiterName,
      recruiterEmail,
      additionalJobDescription,
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
    const job = await Job.findById(req.params.id).populate("comments");
    if (!job) {
      return res.status(404).send("Job not found");
    }
    // Comments array
    const comments = job.comments || [];
    // All verified skills for editing
    const allSkillsDocs = await Skill.find({ verified: true }).sort("name");
    const allSkills = allSkillsDocs.map((s) => s.name);
    res.render("jobDetails", {
      job,
      comments,
      allSkills,
      title: `${job.companyName} - Job Details`,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).send("Server error");
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const newComment = {
      content: req.body.content,
      createdAt: new Date(),
    };
    job.comments.push(newComment);
    await job.save();
    res.json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Job status update controller
exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    // Agar status change ho raha hai toh hi history mein add karo
    if (job.status !== status) {
      job.statusHistory = job.statusHistory || [];
      job.statusHistory.push({ status, date: new Date() });
    }
    job.status = status;
    await job.save();

    // Jab bhi status change ho, insights update karo
    const { calculateAndSaveInsights } = require("./insightsController");
    await calculateAndSaveInsights();

    res.redirect("/");
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

exports.updateJobSkills = async (req, res) => {
  try {
    const { id } = req.params;
    let { skills } = req.body;
    if (!Array.isArray(skills)) {
      if (typeof skills === "string" && skills.length > 0) skills = [skills];
      else skills = [];
    }
    // Only allow verified skills
    const verifiedSkills = (
      await Skill.find({ verified: true, name: { $in: skills } })
    ).map((s) => s.name);
    const job = await Job.findByIdAndUpdate(
      id,
      { skills: verifiedSkills },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ success: true, skills: job.skills });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating skills", error: error.message });
  }
};
