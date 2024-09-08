const Note = require("../models/Note");
const Skill = require("../models/Skill");
const mongoose = require("mongoose");

// ... existing code ...

exports.createNote = async (req, res) => {
  try {
    const { title, content, isAIGenerated } = req.body;
    const note = new Note({
      title,
      content,
      user: req.user.id,
      isAIGenerated,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating note", error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isAIGenerated } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this note" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title,
        content,
        isAIGenerated: Boolean(isAIGenerated), // Ensure it's a boolean
      },
      { new: true }
    );
    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res
      .status(500)
      .json({ message: "Error updating note", error: error.message });
  }
};

// ... existing code ...

exports.getNotes = async (req, res, next) => {
  console.log("Entering getNotes controller");
  try {
    if (!req.user || !req.user._id) {
      throw new Error("User not authenticated");
    }
    console.log("User ID:", req.user._id);
    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    console.log("Notes found:", notes.length);
    res.render("notes", { notes, user: req.user });
  } catch (error) {
    console.error("Error in getNotes controller:", error);
    next(error);
  }
};

exports.getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort("name");
    res.json(skills);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching skills", error: error.message });
  }
};

// Add these new controller functions
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, skills, isAIGenerated } = req.body;

    // Create skills if they don't exist
    const skillIds = await Promise.all(
      skills.map(async (skillName) => {
        let skill = await Skill.findOne({ name: skillName });
        if (!skill) {
          skill = new Skill({ name: skillName });
          await skill.save();
        }
        return skill._id;
      })
    );

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title,
        content,
        skills: skillIds,
        isAIGenerated: isAIGenerated || false,
      },
      { new: true }
    );
    res.json(updatedNote);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating note", error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting note", error: error.message });
  }
};

// Add the new getNote function
exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to access this note" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error in getNote:", error);
    res
      .status(500)
      .json({ message: "Error fetching note", error: error.message });
  }
};

// ... existing code ...

exports.getUserNotes = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const notes = await Note.find({ user: req.user._id })
      .select("title createdAt")
      .sort("-createdAt");

    const formattedNotes = notes.map((note) => ({
      _id: note._id,
      title:
        note.title.length > 30
          ? note.title.substring(0, 30) + "..."
          : note.title,
      createdAt: note.createdAt,
    }));

    res.json(formattedNotes);
  } catch (error) {
    console.error("Error in getUserNotes:", error);
    res
      .status(500)
      .json({ message: "Error fetching user notes", error: error.message });
  }
};
