const express = require("express");
const router = express.Router();
const linkedinController = require("../controllers/linkedinController");
const auth = require("../middleware/auth");

// LinkedIn jobs page
router.get("/", auth, linkedinController.getLinkedInJobsPage);

// Extract job details
router.post("/extract", auth, linkedinController.extractJobs);

// Save job
router.post("/save-job", auth, linkedinController.saveJob);

module.exports = router;
