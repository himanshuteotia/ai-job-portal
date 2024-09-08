# Job Application Tracker

Ye project ek simple job application tracker hai jo aapko apne job applications ko manage karne mein madad karta hai.

## Features

- User authentication (login/signup)
- Job applications ko add, view, edit aur delete karna
- Notes add karna har job application ke liye
- Responsive design

## Installation

1. Repository ko clone karein:
   ```
   git clone https://github.com/yourusername/job-application-tracker.git
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