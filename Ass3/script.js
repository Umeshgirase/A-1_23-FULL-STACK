
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "studentHubStudentsV1";

    const defaultStudents = [
        {
            id: "sample-1",
            name: "Aarav Sharma",
            email: "aarav.sharma@email.com",
            roll: "IT2024001",
            course: "Information Technology",
            year: "2nd Year",
            status: "Active"
        },
        {
            id: "sample-2",
            name: "Priya Kulkarni",
            email: "priya.k@email.com",
            roll: "IT2024002",
            course: "Information Technology",
            year: "2nd Year",
            status: "Active"
        },
        {
            id: "sample-3",
            name: "Rohan Deshmukh",
            email: "rohan.d@email.com",
            roll: "CO2023008",
            course: "Computer Engineering",
            year: "3rd Year",
            status: "Inactive"
        },
        {
            id: "sample-4",
            name: "Sneha Nair",
            email: "sneha.nair@email.com",
            roll: "IT2025006",
            course: "Information Technology",
            year: "1st Year",
            status: "Active"
        },
        {
            id: "sample-5",
            name: "Vedant Patil",
            email: "vedant.p@email.com",
            roll: "ME2024009",
            course: "Mechanical Engineering",
            year: "2nd Year",
            status: "Active"
        }
    ];

    const form = document.querySelector("#studentForm");
    const nameInput = document.querySelector("#studentName");
    const emailInput = document.querySelector("#studentEmail");
    const rollInput = document.querySelector("#rollNumber");
    const yearInput = document.querySelector("#studentYear");
    const courseInput = document.querySelector("#studentCourse");

    const tableBody = document.querySelector("#studentTableBody");
    const searchInput = document.querySelector("#searchInput");
    const courseFilter = document.querySelector("#courseFilter");
    const emptyState = document.querySelector("#emptyState");
    const recordCount = document.querySelector("#recordCount");

    const totalStudents = document.querySelector("#totalStudents");
    const totalCourses = document.querySelector("#totalCourses");
    const formMessage = document.querySelector("#formMessage");
    const activityList = document.querySelector("#activityList");

    let activityItems = [];
    let students = loadStudents();

    // Load saved students from browser storage
    function loadStudents() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === null) {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(defaultStudents)
                );
                return [...defaultStudents];
            }

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [...defaultStudents];

        } catch (error) {
            console.warn(
                "Browser storage is unavailable. Using sample data.",
                error
            );

            return [...defaultStudents];
        }
    }

    // Save student records
    function saveStudents() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(students)
            );

        } catch (error) {
            console.error("Could not save student records.", error);

            setMessage(
                "Records could not be saved in this browser.",
                true
            );
        }
    }

    // Display form messages
    function setMessage(message, isError = false) {
        formMessage.textContent = message;
        formMessage.classList.toggle("error", isError);
    }

    // Display shorter course names in table
    function formatCourse(course) {
        const shortNames = {
            "Information Technology": "Information Tech.",
            "Computer Engineering": "Computer Engg.",
            "Mechanical Engineering": "Mechanical Engg.",
            "Electronics Engineering": "Electronics Engg."
        };

        return shortNames[course] || course;
    }

    // Create a table cell safely
    function makeCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    // Display student records with search and filter
    function renderStudents() {
        const searchText = searchInput.value.trim().toLowerCase();
        const selectedCourse = courseFilter.value;

        const filteredStudents = students.filter((student) => {
            const searchableText = [
                student.name,
                student.email,
                student.roll,
                student.course,
                student.year,
                student.status
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchText);

            const matchesCourse =
                !selectedCourse || student.course === selectedCourse;

            return matchesSearch && matchesCourse;
        });

        tableBody.replaceChildren();

        filteredStudents.forEach((student) => {
            const row = document.createElement("tr");
            row.dataset.id = student.id;

            // Student name and email
            const studentCell = document.createElement("td");

            const name = document.createElement("span");
            name.className = "student-name";
            name.textContent = student.name;

            const email = document.createElement("span");
            email.className = "student-email";
            email.textContent = student.email;

            studentCell.append(name, email);

            // Other student details
            const rollCell = makeCell(student.roll);
            const courseCell = makeCell(formatCourse(student.course));
            const yearCell = makeCell(student.year);

            // Student status
            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.className =
                "status" +
                (student.status === "Active" ? " status-active" : "");

            statusBadge.textContent = student.status;
            statusCell.appendChild(statusBadge);

            // Delete button
            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-button";
            deleteButton.dataset.deleteId = student.id;
            deleteButton.textContent = "Delete";

            deleteButton.setAttribute(
                "aria-label",
                `Delete ${student.name}`
            );

            actionCell.appendChild(deleteButton);

            row.append(
                studentCell,
                rollCell,
                courseCell,
                yearCell,
                statusCell,
                actionCell
            );

            tableBody.appendChild(row);
        });

        // Show message when no matching students exist
        emptyState.hidden = filteredStudents.length !== 0;

        if (searchText || selectedCourse) {
            recordCount.textContent =
                `Showing ${filteredStudents.length} of ${students.length} students`;
        } else {
            recordCount.textContent =
                `Showing ${students.length} student${students.length === 1 ? "" : "s"}`;
        }
    }

    // Update dashboard statistics
    function renderStats() {
        totalStudents.textContent =
            students.length.toLocaleString("en-IN");

        const courseCount = new Set(
            students.map((student) => student.course)
        ).size;

        totalCourses.textContent =
            courseCount.toLocaleString("en-IN");
    }

    // Add an activity message
    function addActivity(title, description, symbol = "✓") {
        activityItems.unshift({
            title,
            description,
            symbol,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        });

        activityItems = activityItems.slice(0, 4);
        renderActivity();
    }

    // Display recent activities
    function renderActivity() {
        activityList.replaceChildren();

        if (activityItems.length === 0) {
            const empty = document.createElement("p");
            empty.className = "activity-empty";
            empty.textContent =
                "No activity yet. Add or delete a student to see updates here.";

            activityList.appendChild(empty);
            return;
        }

        activityItems.forEach((item) => {
            const entry = document.createElement("div");
            entry.className = "activity-entry";

            const dot = document.createElement("span");
            dot.className = "activity-dot";
            dot.textContent = item.symbol;

            const details = document.createElement("div");

            const title = document.createElement("strong");
            title.textContent = item.title;

            const description = document.createElement("p");
            description.textContent = item.description;

            const time = document.createElement("small");
            time.textContent = item.time;

            details.append(title, description, time);
            entry.append(dot, details);

            activityList.appendChild(entry);
        });
    }

    // Refresh the table and dashboard
    function refreshDashboard() {
        renderStudents();
        renderStats();
    }

    // Add a student
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        setMessage("");

        const student = {
            id: `student-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            roll: rollInput.value.trim(),
            year: yearInput.value,
            course: courseInput.value,
            status: "Active"
        };

        // Check required details
        if (
            !student.name ||
            !student.email ||
            !student.roll ||
            !student.year ||
            !student.course
        ) {
            setMessage("Please complete every field.", true);
            return;
        }

        // Prevent duplicate roll numbers
        const duplicateRoll = students.some((existing) =>
            existing.roll.toLowerCase() === student.roll.toLowerCase()
        );

        if (duplicateRoll) {
            setMessage(
                "That roll number already exists. Please use a unique roll number.",
                true
            );

            rollInput.focus();
            return;
        }

        // Add student to array
        students.push(student);

        // Save and refresh dashboard
        saveStudents();
        refreshDashboard();

        // Update recent activity
        addActivity(
            "New student added",
            `${student.name} joined ${formatCourse(student.course)}.`,
            "+"
        );

        // Clear form
        form.reset();

        setMessage(`${student.name} was added successfully.`);
        nameInput.focus();
    });

    // Delete a student
    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-delete-id]");

        if (!button) {
            return;
        }

        const student = students.find(
            (item) => item.id === button.dataset.deleteId
        );

        if (!student) {
            return;
        }

        const confirmed = window.confirm(
            `Delete the record for ${student.name} (${student.roll})?`
        );

        if (!confirmed) {
            return;
        }

        students = students.filter(
            (item) => item.id !== student.id
        );

        saveStudents();
        refreshDashboard();

        addActivity(
            "Student deleted",
            `${student.name}'s record was removed.`,
            "−"
        );

        setMessage(`${student.name}'s record was deleted.`);
    });

    // Search students while typing
    searchInput.addEventListener("input", renderStudents);

    // Filter students by course
    courseFilter.addEventListener("change", renderStudents);

    // Initial page setup
    refreshDashboard();
    renderActivity();
});
