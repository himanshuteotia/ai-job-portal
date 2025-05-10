const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");
const Note = require("../models/Note"); // Add this line

// All routes in notes.js should be protected
router.use(auth);

// Main notes route
router.get("/", noteController.getNotes);

// Other routes
router.get("/user", noteController.getUserNotes);
router.post("/create", noteController.createNote);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

// Fetch a note by ID (move this route up, before the error handling middleware)
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ message: "Error fetching note" });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Error in notes route:", err);
  res.status(500).json({ message: "Error in notes route", error: err.message });
});

module.exports = router;
