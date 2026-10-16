# CampusPlus — Smart Student Hub

A beginner-friendly full-stack Student Management System using React, CSS, JavaScript, Node.js, Express, and MongoDB.

## Features
- Add, view, edit, and delete student records
- Record attendance totals and calculate attendance percentage
- Store marks and calculate performance status
- Flag attendance below 75% and marks below 40
- Search students by name, roll number, or department

## Requirements
- Node.js (LTS)
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code

## 1. Start MongoDB
For a local MongoDB installation, make sure the MongoDB Server service is running.
The default connection string in `server/.env` is:
`mongodb://127.0.0.1:27017/campuspulse`

## 2. Start the backend
Open a terminal in VS Code:
```bash
cd server
npm install
```
Copy `.env.example` to `.env` (or use the included `.env`) and adjust `MONGO_URI` if needed.
Then run:
```bash
npm run dev
```
Backend runs at http://localhost:5000

## 3. Start the frontend
Open a SECOND terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL shown by Vite, usually http://localhost:5173

## How to explain the project
CampusPulse stores student information in MongoDB. React displays the dashboard and sends HTTP requests to the Express API. Express validates the request and reads/writes student documents through Mongoose. Attendance percentage is calculated as `(classesAttended / totalClasses) * 100`. The dashboard flags attendance under 75% or marks under 40.

## API endpoints
- `GET /api/students` — list students
- `GET /api/students/:id` — get one student
- `POST /api/students` — create student
- `PUT /api/students/:id` — update student
- `DELETE /api/students/:id` — delete student
- `GET /api/health` — check API status

## Notes
This is a college-project starter, not a production student information system. Do not enter real sensitive student data.
