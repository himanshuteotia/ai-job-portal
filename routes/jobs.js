const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const analyticsController = require("../controllers/analyticsController");
const insightsController = require("../controllers/insightsController");
const resumeController = require("../controllers/resumeController");
const authController = require("../controllers/authController");
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");
const Job = require("../models/Job");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const skillController = require("../controllers/skillController");

// Add this near the top of your routes
router.get("/favicon.ico", (req, res) => res.status(204));

// Skills Management UI page
router.get("/skills", (req, res) => {
  res.render("skills");
});

// Skills API (must be before any dynamic :id routes)
router.get("/api/skills", skillController.getSkills);
router.post("/api/skills", skillController.addSkill);
router.put("/api/skills/:id/verify", skillController.verifySkill);
router.delete("/api/skills/:id", skillController.deleteSkill);

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
router.get("/:id", auth, jobController.getJobDetails);

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

    // Convert string IDs to ObjectIds
    const noteObjectIds = noteIds.map((id) => mongoose.Types.ObjectId(id));

    // Add new note IDs, avoiding duplicates
    job.relatedNotes = [...new Set([...job.relatedNotes, ...noteObjectIds])];

    const savedJob = await job.save();
    console.log("Saved job with linked notes:", savedJob);

    // Fetch the full note objects for the updated list
    const linkedNotes = await Note.find({ _id: { $in: job.relatedNotes } });

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

// Add this new route for fetching available notes if not already present
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

// Add this new route for unlinking a note
router.post("/:id/unlink-note", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { noteId } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Remove the note from the relatedNotes array
    job.relatedNotes = job.relatedNotes.filter(
      (relatedNoteId) => relatedNoteId.toString() !== noteId
    );

    await job.save();

    res.json({ success: true, message: "Note unlinked successfully" });
  } catch (error) {
    console.error("Error unlinking note:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while unlinking the note.",
      error: error.message,
    });
  }
});

// Add this new route for fetching related notes
router.get("/:id/related-notes", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("relatedNotes");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job.relatedNotes);
  } catch (error) {
    console.error("Error fetching related notes:", error);
    res.status(500).json({ message: "Error fetching related notes" });
  }
});

// Remove or comment out this line if you want to completely disable job editing
// router.get("/edit/:id", jobController.getEditJobForm);
// router.post("/edit/:id", jobController.editJob);

// Job status update route
router.post("/updateStatus/:id", jobController.updateJobStatus);

// Job details route
router.get("/:id", auth, jobController.getJobDetails);

// Delete job route
router.delete("/:id", auth, jobController.deleteJob);

// Add comment route
router.post("/:id/comments", auth, jobController.addComment);

// Add this new route for updating job skills
router.patch("/jobs/:id/skills", jobController.updateJobSkills);

module.exports = router;
