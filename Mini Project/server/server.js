require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./routes/students");

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CampusPulse API" });
});
app.use("/api/students", studentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid student ID." });
  }
  res.status(500).json({ message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campuspulse")
  .then(() => {
    console.log("MongoDB connected.");
    app.listen(PORT, () => console.log(`CampusPulse API running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed. Check that MongoDB Server is running and MONGO_URI is correct.");
    console.error(error.message);
    process.exit(1);
  });
