
const mongoose = require("mongoose");

// Student Schema with Validation
const studentSchema = new mongoose.Schema(
  {
    // Name: Only letters and spaces allowed
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      match: [/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Name must contain only letters and single spaces"]
    },

    // Roll Number: Letters, numbers, and hyphens allowed
    rollNumber: {
      type: Number,
      required: [true, "Roll number is required"],
      trim: true,
      unique: true,
      minlength: [2, "Roll number must contain at least 2 characters"],
      maxlength: [20, "Roll number cannot exceed 20 characters"],
      match: [/^[A-Za-z0-9-]+$/, "Roll number can contain only letters, numbers, and hyphens"]
    },

    // Department: Letters, numbers, spaces, and ampersands allowed
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      minlength: [2, "Department must contain at least 2 characters"],
      maxlength: [50, "Department cannot exceed 50 characters"],
      match: [/^[A-Za-z0-9]+(?:[ &-][A-Za-z0-9]+)*$/, "Enter a valid department name"]
    },

    // Year: Only accepted academic years
    year: {
      type: String,
      required: [true, "Academic year is required"],
      enum: {
        values: ["1", "2", "3", "4", "First Year", "Second Year", "Third Year", "Fourth Year"],
        message: "Year must be 1, 2, 3, 4, or a valid year name"
      }
    },

    // Email: Must be a valid email address when provided
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: [254, "Email cannot exceed 254 characters"],
      validate: {
        validator: function (value) {
          return value === "" ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address"
      }
    },

    // Skills: Letters, numbers, spaces, and common separators
    skills: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Skills cannot exceed 300 characters"],
      match: [/^[A-Za-z0-9+#.,/\- ]*$/, "Skills contain invalid characters"]
    },

    // Classes Attended: Cannot be negative
    classesAttended: {
      type: Number,
      min: [0, "Classes attended cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Classes attended must be a whole number"
      }
    },

    // Total Classes: Cannot be negative
    totalClasses: {
      type: Number,
      min: [0, "Total classes cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Total classes must be a whole number"
      }
    },

    // Marks: Between 0 and 100
    marks: {
      type: Number,
      min: [0, "Marks cannot be less than 0"],
      max: [100, "Marks cannot exceed 100"],
      default: 0
    }
  },
  { timestamps: true }
);

// Attendance percentage
studentSchema.virtual("attendancePercentage").get(function () {
  if (!this.totalClasses) return 0;

  return Math.round(
    (this.classesAttended / this.totalClasses) * 100
  );
});

// Validate attendance consistency
studentSchema.pre("validate", function () {
  if (this.classesAttended > this.totalClasses) {
    this.invalidate(
      "classesAttended",
      "Classes attended cannot exceed total classes"
    );
  }
});

// Include virtual fields in JSON and object output
studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

// Export Student model
module.exports = mongoose.model("Student", studentSchema);
