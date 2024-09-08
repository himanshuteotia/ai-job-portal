# Authentication

Is feature mein user registration, login, aur logout functionality shamil hai.

## Implementation

- Passport.js ka use kiya gaya hai local strategy ke saath
- User passwords bcrypt se hash kiye jaate hain
- Session-based authentication implement ki gayi hai

## Files

- `views/login.ejs`: Login form
- `views/signup.ejs`: Signup form
- `routes/auth.js`: Authentication routes
- `models/User.js`: User model

## Usage

1. `/signup` pe new account create karein
2. `/login` pe existing account se login karein
3. `/logout` pe click karke logout karein