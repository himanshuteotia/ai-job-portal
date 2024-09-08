const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");

// All routes in notes.js should be protected
router.use(auth);

// Main notes route
router.get("/", noteController.getNotes);

// Other routes
router.get("/user", noteController.getUserNotes);
router.get("/:id", noteController.getNote);
router.post("/create", noteController.createNote);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Error in notes route:", err);
  res.status(500).json({ message: "Error in notes route", error: err.message });
});

module.exports = router;
