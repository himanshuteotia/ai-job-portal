const mongoose = require("mongoose");
const User = require("./models/User");
const Job = require("./models/Job");
const Insight = require("./models/Insight");
const UserAnalytics = require("./models/UserAnalytics");
const bcrypt = require("bcryptjs");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const technologies = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Ruby",
  "PHP",
  "Go",
  "Swift",
];
const companies = [
  "Google",
  "Facebook",
  "Amazon",
  "Microsoft",
  "Apple",
  "Netflix",
  "Uber",
  "Airbnb",
  "Twitter",
  "LinkedIn",
];
const statuses = ["Pending", "In Process", "Rejected"];

async function generateMockData() {
  try {
    // Create a mock user
    const hashedPassword = await bcrypt.hash("password123", 8);
    const user = new User({
      username: "mockuser",
      email: "mockuser@example.com",
      password: hashedPassword,
      fullName: "Mock User",
    });
    await user.save();

    // Generate mock jobs
    const jobs = [];
    for (let i = 0; i < 20; i++) {
      const job = new Job({
        user: user._id,
        companyName: companies[Math.floor(Math.random() * companies.length)],
        dateApplied: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ),
        jobDescription: `This is a mock job description for job ${i + 1}`,
        technologies: technologies.sort(() => 0.5 - Math.random()).slice(0, 3),
        experienceRequired: Math.floor(Math.random() * 5) + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
      jobs.push(job);
    }
    await Job.insertMany(jobs);

    // Generate mock insights
    const insight = new Insight({
      user: user._id,
      suggestions: [
        "Consider focusing on React and Node.js as they appear frequently in job listings.",
        "Your application success rate is higher for mid-level positions. Consider targeting these roles.",
        "Improve your Python skills to increase your chances in data-related positions.",
      ],
      techStats: technologies.map((tech) => ({
        name: tech,
        count: Math.floor(Math.random() * 10),
        successRate: Math.random(),
      })),
      statusChanges: {
        Pending: { "In Process": 5, Rejected: 3 },
        "In Process": { Rejected: 2 },
      },
    });
    await insight.save();

    // Generate mock analytics
    const analytics = new UserAnalytics({
      user: user._id,
      jobCounts: {
        "2023-05-01": 2,
        "2023-05-15": 3,
        "2023-06-01": 1,
        "2023-06-15": 4,
      },
      techCounts: technologies.reduce((acc, tech) => {
        acc[tech] = Math.floor(Math.random() * 10);
        return acc;
      }, {}),
      experienceCounts: {
        1: 3,
        2: 5,
        3: 7,
        4: 3,
        5: 2,
      },
      techJobCounts: technologies.reduce((acc, tech) => {
        acc[tech] = Math.floor(Math.random() * 10);
        return acc;
      }, {}),
      startDate: new Date("2023-05-01"),
      endDate: new Date("2023-06-30"),
    });
    await analytics.save();

    console.log("Mock data generated successfully!");
  } catch (error) {
    console.error("Error generating mock data:", error);
  } finally {
    mongoose.connection.close();
  }
}

generateMockData();
