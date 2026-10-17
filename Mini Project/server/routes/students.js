const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

function validateStudent(body) {
  const required = ["name", "rollNumber", "department", "year"];
  for (const field of required) {
    if (!String(body[field] || "").trim()) return `${field} is required.`;
  }

  const attended = Number(body.classesAttended ?? 0);
  const total = Number(body.totalClasses ?? 0);
  const marks = Number(body.marks ?? 0);

  if (!Number.isFinite(attended) || !Number.isFinite(total) || attended < 0 || total < 0) {
    return "Attendance values must be non-negative numbers.";
  }
  if (attended > total) return "Classes attended cannot exceed total classes.";
  if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
    return "Marks must be between 0 and 100.";
  }
  return null;
}

// GET all students, with optional search query
router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { rollNumber: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } }
          ]
        }
      : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
});

// GET one student
router.get("/:id", async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) {
    next(error);
  }
});

// CREATE student
router.post("/", async (req, res, next) => {
  try {
    const validationError = validateStudent(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That roll number already exists." });
    }
    next(error);
  }
});

// UPDATE student
router.put("/:id", async (req, res, next) => {
  try {
    const validationError = validateStudent(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That roll number already exists." });
    }
    next(error);
  }
});

// DELETE student
router.delete("/:id", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
