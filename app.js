const jobRoutes = require("./routes/jobs");
const noteRoutes = require("./routes/notes");
const skillRoutes = require("./routes/skills");
const insightRoutes = require("./routes/insights");
const resumeRoutes = require("./routes/resume");

app.use("/jobs", jobRoutes);
app.use("/notes", noteRoutes);
app.use("/skills", skillRoutes);
app.use("/insights", insightRoutes);
app.use("/create-resume", resumeRoutes);
