# Job Application Tracker

## Features

- User authentication (login/signup)
- Job applications ko add, view, edit aur delete karna
- Notes add karna har job application ke liye
- Responsive design

## Installation

1. Repository ko clone karein:
   ```
   git clone https://github.com/himanshuteotia/job-application-tracker.git
   ```
2. Dependencies install karein:
   ```
   npm install
   ```
3. Environment variables set karein:
   ```
   cp .env.example .env
   ```
   Phir .env file mein apne database credentials aur session secret add karein.

4. Database migrations run karein:
   ```
   npm run migrate
   ```
5. Server start karein:
   ```
   npm start
   ```

## Usage

1. Browser mein `http://localhost:3000` pe jaayein
2. Sign up ya login karein
3. Dashboard pe job applications add, view, edit ya delete karein
4. Har job ke liye notes add karein

## Folder Structure

- `models/`: Database models
- `views/`: EJS templates
- `public/`: Static files (CSS, client-side JS)
- `routes/`: Express routes
- `docs/`: Feature-specific documentation

Zyada details ke liye, `docs/` folder mein har feature ki alag README file check karein.

## Contributing

Contributions ka swagat hai! Kripya pehle ek issue create karein ya existing issue pe comment karein before starting work on a PR.

## License

ISC License

## Insights & Analytics System

This project includes a daily insights system that analyzes your job application data and provides actionable analytics and AI-powered suggestions. The insights are calculated and stored automatically every day using a cron job.

### What is Tracked?
- **Status Transitions:**
  - Tracks how many jobs moved from Pending to In Process, Rejected, or Success each day.
  - Uses a `statusHistory` array in each Job document to accurately track all status changes over time.
- **Technology Success Rate:**
  - For each skill/technology, calculates how many jobs used that skill and how many of those were successful (status = Success).
  - Shows which skills are most effective for your job search.
- **AI Suggestions:**
  - Based on your application history, the system suggests which skills or areas you should focus on to improve your chances of success.

### How Does It Work?
- Every day, a cron job runs and:
  1. Fetches all jobs from the database.
  2. Analyzes status transitions using the `statusHistory` field.
  3. Calculates technology success rates.
  4. Generates AI suggestions based on your data.
  5. Saves a new document in the `insights` collection with all this information.
- The Insights page always shows the latest daily insights.

### Cron Job Setup
- The cron job is configured using the `node-cron` package.
- The schedule for the cron job is set in the `.env` file using the `INSIGHTS_CRON_SCHEDULE` variable (e.g., `0 2 * * *` for every day at 2 AM).
- You can change the schedule as needed.

### Example .env Entry
```
INSIGHTS_CRON_SCHEDULE=0 2 * * *
```

### Extending Insights
- You can add more analytics, suggestions, or custom logic by editing the helpers in `utils/insightHelpers.js` and the cron job script.
