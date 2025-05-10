const User = require("../models/User");
const Job = require("../models/Job");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");

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

// Mock AI response for now
const getMockAIResponse = (job) => {
  return {
    resumeContent: `Dear ${job.recruiterName || "Hiring Manager"},

I am writing to express my strong interest in the ${job.jobTitle} position at ${
      job.companyName
    }. 

Skills and Experience:
${job.skills.join(", ")}

${job.additionalJobDescription || ""}

Thank you for considering my application.

Best regards,
Himanshu Teotia`,

    emailBody: `Dear ${job.recruiterName || "Hiring Manager"},

Please find attached my resume for the ${job.jobTitle} position at ${
      job.companyName
    }.

I look forward to discussing how my skills and experience align with your requirements.

Best regards,
Himanshu Teotia`,
  };
};

exports.getCreateResumeForm = async (req, res) => {
  try {
    // Get all pending jobs
    const pendingJobs = await Job.find({
      user: req.user._id,
      status: "Pending",
    }).sort({ dateApplied: -1 });

    res.render("createResume", { jobs: pendingJobs });
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching jobs" });
  }
};

exports.createResumeAndSendEmail = async (req, res) => {
  try {
    const { jobId, additionalDescription, recruiterName, recruiterEmail } =
      req.body;

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Update job with additional description and recruiter details if provided
    if (additionalDescription || recruiterName || recruiterEmail) {
      if (additionalDescription)
        job.additionalJobDescription = additionalDescription;
      if (recruiterName) job.recruiterName = recruiterName;
      if (recruiterEmail) job.recruiterEmail = recruiterEmail;
      await job.save();
    }

    // Get AI response with updated recruiter details
    const aiResponse = getMockAIResponse({
      ...job.toObject(),
      recruiterName: recruiterName || job.recruiterName,
      recruiterEmail: recruiterEmail || job.recruiterEmail,
    });

    // Create PDF
    const doc = new PDFDocument();
    const uniqueId = uuidv4();
    const resumeFileName = `HIMANSHU_TEOTIA_${uniqueId}.pdf`;
    const resumePath = path.join(
      __dirname,
      "..",
      "uploads",
      "resumes",
      resumeFileName
    );

    // Ensure directory exists
    const dir = path.dirname(resumePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Pipe PDF content with proper resume formatting
    doc.pipe(fs.createWriteStream(resumePath));

    // Header with name and title
    doc.fontSize(24).text("HIMANSHU TEOTIA", { align: "center" });
    doc.fontSize(16).text("Software Engineer", { align: "center" });
    doc.moveDown();

    // Contact Information
    doc
      .fontSize(10)
      .text("Email: himanshu.teotia@example.com", { align: "center" });
    doc.text("Location: New Delhi, India", { align: "center" });
    doc.text("LinkedIn: linkedin.com/in/himanshut", { align: "center" });
    doc.moveDown();

    // Professional Summary
    doc.fontSize(14).text("PROFESSIONAL SUMMARY", { underline: true });
    doc
      .fontSize(12)
      .text(
        `Experienced software engineer with expertise in full-stack development, currently seeking the role of ${job.jobTitle} at ${job.companyName}.`
      );
    doc.moveDown();

    // Skills
    doc.fontSize(14).text("TECHNICAL SKILLS", { underline: true });
    doc.fontSize(12).text(job.skills.join(", "));
    doc.moveDown();

    // Additional Information
    if (additionalDescription) {
      doc.fontSize(14).text("ADDITIONAL INFORMATION", { underline: true });
      doc.fontSize(12).text(additionalDescription);
      doc.moveDown();
    }

    // Experience (Mock data - you can customize this)
    doc.fontSize(14).text("WORK EXPERIENCE", { underline: true });
    doc.fontSize(12).text("Senior Software Engineer - XYZ Company");
    doc.fontSize(10).text("January 2020 - Present");
    doc
      .fontSize(12)
      .text("• Led development of multiple full-stack applications");
    doc
      .fontSize(12)
      .text("• Implemented CI/CD pipelines and improved deployment processes");
    doc
      .fontSize(12)
      .text("• Mentored junior developers and conducted code reviews");
    doc.moveDown();

    // Education (Mock data - you can customize this)
    doc.fontSize(14).text("EDUCATION", { underline: true });
    doc.fontSize(12).text("Bachelor of Technology in Computer Science");
    doc.fontSize(10).text("University Name - 2019");
    doc.moveDown();

    doc.end();

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: job.recruiterEmail || job.email,
      subject: `Application for ${job.jobTitle} position at ${job.companyName}`,
      text: aiResponse.emailBody,
      attachments: [
        {
          filename: resumeFileName,
          path: resumePath,
        },
      ],
    });

    // Update job with resume info
    job.resumePath = resumePath;
    job.emailSent = true;
    job.emailSentDate = new Date();
    await job.save();

    res.json({
      success: true,
      message: "Resume created and email sent successfully",
    });
  } catch (error) {
    console.error("Error in resume creation:", error);
    res.status(500).json({
      success: false,
      message: "Error creating resume and sending email",
      error: error.message,
    });
  }
};

// Get pending job emails
exports.getPendingEmails = async (req, res) => {
  try {
    const pendingJobs = await Job.find({
      user: req.user._id,
      status: "Pending",
      emailSent: { $ne: true }, // Emails not sent yet
    });

    const emails = pendingJobs
      .map((job) => job.recruiterEmail)
      .filter((email) => email && email.trim() !== "");

    res.json({
      success: true,
      emails: emails,
    });
  } catch (error) {
    console.error("Error fetching pending emails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending emails",
      error: error.message,
    });
  }
};

// Bulk send emails
exports.bulkSendEmails = async (req, res) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    const { emails, emailBody, emailSubject } = req.body;
    const emailList = JSON.parse(emails);

    if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses provided",
      });
    }

    if (!emailSubject) {
      return res.status(400).json({
        success: false,
        message: "Email subject is required",
      });
    }

    // Save the uploaded resume
    const resumeFile = req.files.resume;
    const uniqueId = uuidv4();
    const resumeFileName = `HIMANSHU_TEOTIA_${uniqueId}.pdf`;
    const resumePath = path.join(
      __dirname,
      "..",
      "uploads",
      "resumes",
      resumeFileName
    );

    // Ensure directory exists
    const dir = path.dirname(resumePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Move the uploaded file
    await resumeFile.mv(resumePath);

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send emails to all recipients
    const emailPromises = emailList.map((email) =>
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: emailSubject,
        text: emailBody,
        attachments: [
          {
            filename: resumeFileName,
            path: resumePath,
          },
        ],
      })
    );

    await Promise.all(emailPromises);

    // Update jobs with emailSent status
    await Job.updateMany(
      {
        user: req.user._id,
        recruiterEmail: { $in: emailList },
        emailSent: { $ne: true },
      },
      {
        $set: {
          emailSent: true,
          emailSentDate: new Date(),
          resumePath: resumePath,
        },
      }
    );

    res.json({
      success: true,
      message: `Successfully sent emails to ${emailList.length} recipients`,
    });
  } catch (error) {
    console.error("Error in bulk email sending:", error);
    res.status(500).json({
      success: false,
      message: "Error sending bulk emails",
      error: error.message,
    });
  }
};
