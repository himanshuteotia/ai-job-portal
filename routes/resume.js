const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const auth = require("../middleware/auth");
const fileUpload = require("express-fileupload");

// Enable file upload
router.use(fileUpload());

// Get resume creation form (accessible via /create-resume)
router.get("/", auth, resumeController.getCreateResumeForm);
router.get("/create", auth, resumeController.getCreateResumeForm);

// Create resume and send email
router.post("/create", auth, resumeController.createResumeAndSendEmail);

// Get pending job emails
router.get("/pending-emails", auth, resumeController.getPendingEmails);

// Bulk send emails
router.post("/bulk-send", auth, resumeController.bulkSendEmails);

module.exports = router;
