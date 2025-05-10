const Skill = require("../models/Skill");
const Job = require("../models/Job");

exports.getSkills = async (req, res) => {
  try {
    let skills;
    if (req.query.all === "true") {
      skills = await Skill.find().sort("name");
    } else {
      skills = await Skill.find({ verified: true }).sort("name");
    }
    res.json(skills);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching skills", error: error.message });
  }
};

exports.addSkill = async (req, res) => {
  try {
    let { name } = req.body;
    if (!name) return res.status(400).json({ message: "Skill name required" });
    name = name.toLowerCase();
    let skill = await Skill.findOne({ name });
    if (!skill) {
      skill = new Skill({ name });
      await skill.save();
    }
    res.status(201).json(skill);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding skill", error: error.message });
  }
};

exports.verifySkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      id,
      { verified },
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying skill", error: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if any job is using this skill
    const jobUsingSkill = await Job.findOne({ skills: id });
    if (jobUsingSkill) {
      return res
        .status(400)
        .json({ message: "Skill is used in a job and cannot be deleted." });
    }
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting skill", error: error.message });
  }
};
