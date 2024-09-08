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
const Note = require("../models/Note"); // Add this at the top of the file

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
router.get("/:id", async (req, res) => {
  // Favicon.ico request ko ignore karo
  if (req.params.id === "favicon.ico") {
    return res.status(204).end();
  }

  try {
    const jobId = req.params.id;
    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).send("Invalid job ID");
    }

    const job = await Job.findById(jobId).populate("relatedNotes");
    if (!job) {
      return res.status(404).send("Job not found");
    }
    res.render("jobDetails", { job });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).send("Server error");
  }
});

// Add comment route
router.post("/:id/comments", async (req, res) => {
  console.log(`Adding comment to job with ID: ${req.params.id}`);
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
});

// Error handling for token expiration
router.use((err, req, res, next) => {
  if (err.name === "TokenExpiredError") {
    return res.redirect("/login?expired=true");
  }
  next(err);
});

// Modify this route
router.post("/link-notes", auth, async (req, res) => {
  try {
    const { jobId, noteIds } = req.body;
    console.log(`Linking notes to job ${jobId}:`, noteIds);

    const job = await Job.findById(jobId);
    if (!job) {
      console.log(`Job not found: ${jobId}`);
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("Current job.relatedNotes:", job.relatedNotes);

    // Convert string IDs to ObjectIds
    const noteObjectIds = noteIds.map((id) => mongoose.Types.ObjectId(id));
    console.log("Note ObjectIds to add:", noteObjectIds);

    // Add new note IDs, avoiding duplicates
    job.relatedNotes = [...new Set([...job.relatedNotes, ...noteObjectIds])];
    console.log("Updated job.relatedNotes:", job.relatedNotes);

    const savedJob = await job.save();
    console.log("Saved job:", savedJob);

    // Fetch the full note objects for the updated list
    const linkedNotes = await Note.find({ _id: { $in: job.relatedNotes } });
    console.log("Fetched linked notes:", linkedNotes);

    res.json({ success: true, linkedNotes });
  } catch (error) {
    console.error("Error linking notes:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while linking notes.",
      error: error.message,
    });
  }
});

// Add this new route for fetching available notes
router.get("/:id/available-notes", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const allNotes = await Note.find({ user: req.user._id });
    const availableNotes = allNotes.filter(
      (note) => !job.relatedNotes.includes(note._id)
    );

    res.json(availableNotes);
  } catch (error) {
    console.error("Error fetching available notes:", error);
    res.status(500).json({ message: "Error fetching available notes" });
  }
});

module.exports = router;
