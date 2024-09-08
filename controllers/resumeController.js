const User = require("../models/User");

exports.getResumeForm = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("create-resume", { fullName: user.fullName });
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching user data" });
  }
};

exports.createResume = async (req, res) => {
  try {
    const { fullName, experience, skills } = req.body;

    // Mock resume generation
    const resumeHtml = `
      <h1>${fullName}</h1>
      <h2>Professional Summary</h2>
      <p>A motivated professional with experience in ${experience}. Skilled in ${skills}.</p>
      
      <h2>Work Experience</h2>
      <h3>Job Title</h3>
      <p>Company Name | Start Date - End Date</p>
      <ul>
        <li>Accomplishment 1</li>
        <li>Accomplishment 2</li>
        <li>Accomplishment 3</li>
      </ul>
      
      <h2>Skills</h2>
      <ul>
        ${skills
          .split(",")
          .map((skill) => `<li>${skill.trim()}</li>`)
          .join("")}
      </ul>
      
      <h2>Education</h2>
      <p>Degree Name, University Name, Graduation Year</p>
    `;

    res.render("resume", { resumeHtml });
  } catch (error) {
    console.error("Error generating resume:", error);
    res
      .status(500)
      .render("error", { message: "Error creating resume. Please try again." });
  }
};
