# Habit Tracker

A simple web application to track and manage daily habits, built with HTML, CSS, and JavaScript. Features include adding, editing, and deleting habits, tracking streaks, and viewing progress statistics.

## Features
- User authentication (login/register) with localStorage
- Add, edit, and delete habits
- Track daily habit completion and streaks
- View statistics (active habits, completed today, highest streak, completion rate)
- Light/dark mode toggle
- Responsive design for mobile and desktop

## Project Structure
habit-tracker/
│
├── index.html         # Main HTML file
├── css/
│   └── styles.css     # Stylesheet
├── js/
│   ├── app.js         # Entry point
│   ├── habitTracker.js # Habit management logic
│   ├── storage.js     # LocalStorage handling
│   ├── utils.js       # Utility functions
│   └── ui.js          # UI rendering and event handling
├── .gitignore         # Git ignore file
└── README.md          # Project documentation


## Getting Started
1. Clone the repository:
git clone https://github.com/ceedevgirl/habit-tracker.git

2. Open `index.html` in a web browser to run the app locally.

## Usage
- Register or log in to start tracking habits.
- Add habits with details like name, category, goal, and difficulty.
- Mark habits as completed daily to build streaks.
- Use the stats overview to monitor your progress.

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Remixicon for icons
- Google Fonts (Inter)

## Notes
- Data is stored in the browser's localStorage.
- No backend or database is used; this is a front-end-only app.

## License
This project is free to use