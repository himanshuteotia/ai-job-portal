const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const analyticsController = require("../controllers/analyticsController");
const insightsController = require("../controllers/insightsController");
const resumeController = require("../controllers/resumeController");
const authController = require("../controllers/authController");
const noteController = require("../controllers/noteController"); // Add this line
const auth = require("../middleware/auth");
const Job = require("../models/Job");
const mongoose = require("mongoose");

// Main route for jobs listing
router.get("/", auth, jobController.getJobs);

// Public routes
router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login", { error: null }));
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Protected routes
router.use(auth);

// Job routes
router.get("/add", jobController.getAddJobForm);
router.post("/add", jobController.addJob);
router.post("/job/:id/link-notes", jobController.linkNotes);

// Analytics routes
router.get("/analytics", analyticsController.getAnalytics);

// Insights routes
router.get("/insights", insightsController.getInsights);
router.post("/regenerate-insights", insightsController.regenerateInsights);

// Resume routes
router.get("/create-resume", resumeController.getResumeForm);
router.post("/create-resume", resumeController.createResume);

// Profile routes
router.get("/profile", authController.getProfile);
router.post("/update-profile", authController.updateProfile);

// Notes route
router.get("/notes", auth, noteController.getNotes);

// Job details route
router.get("/:id", auth, async (req, res) => {
  console.log(`Accessing job with ID: ${req.params.id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid job ID");
    }

    const job = await Job.findById(req.params.id).populate("notes");
    if (!job) {
      return res.status(404).send("Job not found");
    }
    res.render("jobDetails", { job });
  } catch (error) {
    console.error("Error in job details route:", error);
    res.status(500).send("Server error");
  }
});

// Add comment route
router.post("/:id/comments", async (req, res) => {
  console.log(`Adding comment to job with ID: ${req.params.id}`);
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send("Job not found");
    }

    const newComment = {
      content: req.body.content,
      createdAt: new Date(),
    };

    job.comments.push(newComment);
    await job.save();

    res.redirect(`/jobs/${job._id}`);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Server error");
  }
});

// Error handling for token expiration
router.use((err, req, res, next) => {
  if (err.name === "TokenExpiredError") {
    return res.redirect("/login?expired=true");
  }
  next(err);
});

// Add this new route for linking notes
router.post("/:id/link-notes", auth, async (req, res) => {
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
});

module.exports = router;
