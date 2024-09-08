# Notes Feature

Is feature se users har job application ke liye notes add kar sakte hain.

## Implementation

- Notes ko Job model mein embed kiya gaya hai
- AJAX requests ka use kiya gaya hai for seamless note addition

## Files

- `views/notes.ejs`: Notes display and form
- `routes/jobs.js`: Note-related routes
- `public/js/notes.js`: Client-side JavaScript for note management

## Usage

1. Kisi job ke details page pe jaayein
2. "Add Note" section mein apna note type karein
3. "Add" button pe click karein
4. Notes list automatically update ho jaayegi