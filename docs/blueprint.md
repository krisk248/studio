# **App Name**: QuizMate

## Core Features:

- Landing Page: Landing page with quiz title from CSV, name input field, and "No Quiz Today" message if no CSV is uploaded.
- CSV Parsing: Parse CSV data (quiz details, questions, answers, explanations) hosted on Netlify. CSV is updated via file upload, requires no database.
- Quiz Presentation: Presents one question at a time from the parsed CSV data. Each question displays the question, multiple-choice answers, and feedback after each answer submission with correct answer and explanation shown.
- Second Chance: Provides a 'second chance' if the first answer is incorrect.
- Results and Logging: Records each user's name, date, time, answers, tries, and total score in a text file; shows the score at the end of the quiz.

## Style Guidelines:

- Primary color: Soft blue (#64B5F6) for a calm and engaging experience, fostering concentration.
- Background color: Light gray (#F0F4F8) to reduce eye strain and provide a comfortable reading experience, especially beneficial for older users.
- Accent color: Muted green (#81C784) to indicate correct answers or positive feedback, promoting a sense of accomplishment.
- Set a base font size and allow the user to increase font size. Make this configurable in the settings menu. Target a minimum font size of 16pt, but allow for an increase of at least 2x.
- Responsive design that adapts to phones, tablets, and laptops. Keep quiz controls in easy reach, regardless of device. On smaller screens use a stacked layout.
- Use simple, recognizable icons for navigation and feedback.