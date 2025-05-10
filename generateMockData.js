const mongoose = require("mongoose");
const User = require("./models/User");
const Job = require("./models/Job");
const Insight = require("./models/Insight");
const Note = require("./models/Note");
const Skill = require("./models/Skill");
const UserAnalytics = require("./models/UserAnalytics");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Set strictQuery to false to remove deprecation warning
mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Enhanced mock data arrays
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
  "TypeScript",
  "Angular",
  "Vue.js",
  "Django",
  "Spring Boot",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST API",
  "Git",
  "CI/CD",
  "Agile",
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
  "Adobe",
  "Salesforce",
  "Oracle",
  "IBM",
  "Intel",
  "NVIDIA",
  "Tesla",
  "SpaceX",
  "Stripe",
  "Shopify",
  "Atlassian",
  "Slack",
  "Zoom",
  "Dropbox",
  "Spotify",
  "Pinterest",
  "Reddit",
  "Discord",
  "Twitch",
  "GitHub",
];

const jobTitles = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Architect",
  "Mobile Developer",
  "QA Engineer",
  "Product Manager",
  "Technical Lead",
  "Solutions Architect",
  "Security Engineer",
  "Blockchain Developer",
];

const locations = [
  "San Francisco, CA",
  "New York, NY",
  "Seattle, WA",
  "Austin, TX",
  "Boston, MA",
  "Chicago, IL",
  "Denver, CO",
  "Portland, OR",
  "Remote",
  "Hybrid",
];

const statuses = ["Pending", "In Process", "Rejected", "Success"];

const noteTemplates = [
  "Initial application submitted",
  "Recruiter screening scheduled",
  "Technical interview completed",
  "System design interview scheduled",
  "HR discussion completed",
  "Reference check in progress",
  "Offer negotiation started",
  "Final interview completed",
  "Application rejected",
  "Offer accepted",
];

const insightTemplates = [
  "Your applications in {technology} have a {percentage}% success rate",
  "Companies in {location} respond faster to your applications",
  "Your experience level matches {percentage}% of job requirements",
  "Skills gap identified in {technology}",
  "Application success rate increased by {percentage}% this month",
  "Most successful applications are for {jobTitle} positions",
  "Companies prefer candidates with {skill} experience",
  "Your resume matches {percentage}% of job descriptions",
  "Application response time decreased by {percentage}%",
  "Success rate higher for {companyType} companies",
];

// Add the clearExistingData function
async function clearExistingData() {
  try {
    console.log("Clearing existing data...");
    // Clear all collections except users
    await Job.deleteMany({});
    await Note.deleteMany({});
    await Insight.deleteMany({});
    await Skill.deleteMany({});
    await UserAnalytics.deleteMany({});
    console.log("All existing data cleared successfully");
  } catch (error) {
    console.error("Error clearing existing data:", error);
    throw error;
  }
}

async function generateMockData() {
  try {
    // Clear existing data first
    await clearExistingData();

    // Get existing user or create new one
    let user = await User.findOne({ email: "mockuser@example.com" });
    if (!user) {
      try {
        const hashedPassword = await bcrypt.hash("password123", 8);
        user = new User({
          username: "mockuser",
          email: "mockuser@example.com",
          password: hashedPassword,
          fullName: "Mock User",
        });
        await user.save();
        console.log("New user created successfully");
      } catch (error) {
        if (error.code === 11000) {
          // If user already exists, fetch it
          user = await User.findOne({ email: "mockuser@example.com" });
          console.log("Using existing user");
        } else {
          throw error;
        }
      }
    } else {
      console.log("Using existing user");
    }

    // Generate and save skills
    const skills = technologies.map((tech) => ({
      name: tech,
      verified: true,
      category: "Technology",
    }));
    await Skill.insertMany(skills);

    // Generate mock jobs
    const jobs = [];
    for (let i = 0; i < 30; i++) {
      const dateApplied = new Date(
        Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
      );

      const job = new Job({
        user: user._id,
        companyName: companies[Math.floor(Math.random() * companies.length)],
        jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
        dateApplied: dateApplied,
        jobDescription: `This is a detailed job description for ${
          jobTitles[Math.floor(Math.random() * jobTitles.length)]
        } position at ${
          companies[Math.floor(Math.random() * companies.length)]
        }. The role requires expertise in ${technologies
          .sort(() => 0.5 - Math.random())
          .slice(0, 5)
          .join(", ")}.`,
        skills: technologies.sort(() => 0.5 - Math.random()).slice(0, 5),
        experienceRequired: Math.floor(Math.random() * 5) + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        salary: `$${Math.floor(Math.random() * 100 + 50)}k - $${Math.floor(
          Math.random() * 100 + 150
        )}k`,
        source: ["LinkedIn", "Company Website", "Referral", "Job Board"][
          Math.floor(Math.random() * 4)
        ],
        highProbability: Math.random() > 0.7,
        statusHistory: [
          {
            status: "Pending",
            date: dateApplied,
          },
        ],
      });
      jobs.push(job);
    }
    await Job.insertMany(jobs);

    // Add comments and notes to jobs
    const allNotes = [];
    for (const job of jobs) {
      // Add 1-3 comments
      job.comments = [];
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < numComments; c++) {
        job.comments.push({
          content: `Comment ${c + 1} for ${job.companyName} - ${job.jobTitle}`,
          createdAt: new Date(job.dateApplied.getTime() + c * 60 * 60 * 1000),
        });
      }
      // Add 1-2 notes
      const numNotes = Math.floor(Math.random() * 2) + 1;
      for (let n = 0; n < numNotes; n++) {
        const noteContent =
          noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
        allNotes.push(
          new Note({
            user: user._id,
            job: job._id,
            title: `Note ${n + 1} for ${job.companyName} - ${job.jobTitle}`,
            content: noteContent,
            createdAt: new Date(
              job.dateApplied.getTime() + n * 2 * 60 * 60 * 1000
            ),
          })
        );
      }
      await job.save();
    }

    // Generate standalone notes (not attached to jobs above)
    const notes = [];
    for (let i = 0; i < 20; i++) {
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const noteContent =
        noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
      notes.push(
        new Note({
          user: user._id,
          job: job._id,
          title: `Note for ${job.companyName} - ${job.jobTitle}`,
          content: noteContent,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ),
        })
      );
    }
    await Note.insertMany([...allNotes, ...notes]);

    // Generate mock insights
    const insights = [];
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
      const insightTemplate =
        insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      const randomTech =
        technologies[Math.floor(Math.random() * technologies.length)];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      const randomJobTitle =
        jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const randomSkill =
        technologies[Math.floor(Math.random() * technologies.length)];
      const randomPercentage = Math.floor(Math.random() * 50 + 50);
      const companyTypes = [
        "Tech",
        "Finance",
        "Healthcare",
        "E-commerce",
        "Startup",
        "Enterprise",
      ];

      // Generate meaningful statusChanges
      const pendingToInProcess = Math.floor(Math.random() * 5 + 1); // 1-5
      const pendingToRejected = Math.floor(Math.random() * 4 + 1); // 1-4
      const pendingToSuccess = Math.floor(Math.random() * 3 + 1); // 1-3

      // Generate top skills (techStats)
      const topSkills = [];
      const numSkills = Math.floor(Math.random() * 3) + 2; // 2-4 top skills
      for (let s = 0; s < numSkills; s++) {
        const skillName =
          technologies[Math.floor(Math.random() * technologies.length)];
        const total = Math.floor(Math.random() * 10 + 5); // 5-14
        const success = Math.floor(total * (Math.random() * 0.5 + 0.3)); // 30-80% success
        const successRate = Math.round((success / total) * 100);
        topSkills.push({
          name: skillName,
          total,
          success,
          successRate,
        });
      }

      // Generate AI suggestions
      const numSuggestions = Math.floor(Math.random() * 3) + 1; // 1-3 suggestions
      const suggestions = [];
      for (let s = 0; s < numSuggestions; s++) {
        suggestions.push(
          insightTemplates[Math.floor(Math.random() * insightTemplates.length)]
            .replace(/{technology}/g, randomTech)
            .replace(/{percentage}/g, randomPercentage.toString())
            .replace(/{location}/g, randomLocation)
            .replace(/{jobTitle}/g, randomJobTitle)
            .replace(/{skill}/g, randomSkill)
            .replace(
              /{companyType}/g,
              companyTypes[Math.floor(Math.random() * companyTypes.length)]
            )
        );
      }

      insights.push(
        new Insight({
          user: user._id,
          content: insightTemplate
            .replace(/{technology}/g, randomTech)
            .replace(/{percentage}/g, randomPercentage.toString())
            .replace(/{location}/g, randomLocation)
            .replace(/{jobTitle}/g, randomJobTitle)
            .replace(/{skill}/g, randomSkill)
            .replace(
              /{companyType}/g,
              companyTypes[Math.floor(Math.random() * companyTypes.length)]
            ),
          date: new Date(now - i * 24 * 60 * 60 * 1000),
          statusChanges: {
            Pending: {
              "In Process": pendingToInProcess,
              Rejected: pendingToRejected,
              Success: pendingToSuccess,
            },
          },
          techStats: topSkills,
          suggestions,
          type: "application_insight",
          metrics: {
            successRate: randomPercentage,
            responseTime: Math.floor(Math.random() * 7) + 1,
            matchRate: Math.floor(Math.random() * 30) + 70,
          },
        })
      );
    }
    await Insight.insertMany(insights);
    console.log("Insights generated successfully");

    // Generate mock analytics
    const analytics = new UserAnalytics({
      user: user._id,
      jobCounts: generateDateBasedCounts(90), // Last 90 days
      techCounts: technologies.reduce((acc, tech) => {
        acc[tech] = Math.floor(Math.random() * 20);
        return acc;
      }, {}),
      experienceCounts: {
        1: Math.floor(Math.random() * 10),
        2: Math.floor(Math.random() * 15),
        3: Math.floor(Math.random() * 20),
        4: Math.floor(Math.random() * 15),
        5: Math.floor(Math.random() * 10),
      },
      techJobCounts: technologies.reduce((acc, tech) => {
        acc[tech] = Math.floor(Math.random() * 15);
        return acc;
      }, {}),
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
    await analytics.save();

    console.log("Mock data generated successfully!");
    console.log(`Generated:
    - ${jobs.length} jobs
    - ${skills.length} skills
    - ${notes.length} notes
    - ${insights.length} insights
    - 1 analytics record`);
  } catch (error) {
    console.error("Error generating mock data:", error);
  } finally {
    mongoose.connection.close();
  }
}

function generateDateBasedCounts(days) {
  const counts = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    counts[date.toISOString().split("T")[0]] = Math.floor(Math.random() * 5);
  }
  return counts;
}

generateMockData();
