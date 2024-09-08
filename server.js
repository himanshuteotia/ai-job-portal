const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // Make sure this line is also present

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/job_tracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if unable to connect to the database
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const jobRoutes = require("./routes/jobs");
const noteRoutes = require("./routes/notes");

// Logging middleware
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

// Use note routes
app.use("/notes", noteRoutes);

// Use job routes for '/jobs' URL
app.use("/jobs", jobRoutes);

// Use job routes for the root URL
app.use("/", jobRoutes);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  if (err.name === "TokenExpiredError") {
    return res.redirect("/login?expired=true");
  }
  res.status(500).render("error", {
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Add this just before app.listen()
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Add this before your routes
app.use(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    console.error("Error setting user:", error);
    // Clear the invalid token
    res.clearCookie("token");
  }
  next();
});

// Temporary route for debugging
app.post("/test-link-notes", (req, res) => {
  console.log("Received request:", req.body);
  res.json({ message: "Test successful" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
