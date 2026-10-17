const form = document.getElementById("studentForm");
const tableBody = document.getElementById("tableBody");
const searchBox = document.getElementById("search");
const emptyMsg = document.getElementById("empty");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");

let students = JSON.parse(localStorage.getItem("students")) || [];
let editId = null;

function save() {
  localStorage.setItem("students", JSON.stringify(students));
}

/* ---------- Validation ---------- */
function setError(input, message) {
  document.getElementById(input.id + "Error").textContent = message;
  input.classList.toggle("invalid", message !== "");
  return message === "";
}

function validateName() {
  const value = nameInput.value.trim();
  if (value === "") return setError(nameInput, "Name is required.");
  if (/\d/.test(value)) return setError(nameInput, "Name cannot contain numbers.");
  if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value))
    return setError(nameInput, "Use letters and single spaces only (no symbols).");
  if (value.length < 2) return setError(nameInput, "Name must be at least 2 letters.");
  return setError(nameInput, "");
}

function validateEmail() {
  const value = emailInput.value.trim().toLowerCase();
  if (value === "") return setError(emailInput, "Email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value))
    return setError(emailInput, "Enter a valid email like name@example.com.");
  const duplicate = students.some(s => s.email.toLowerCase() === value && s.id !== editId);
  if (duplicate) return setError(emailInput, "This email is already registered.");
  return setError(emailInput, "");
}

function validateAge() {
  const value = ageInput.value;
  if (value === "") return setError(ageInput, "Age is required.");
  if (!Number.isInteger(Number(value))) return setError(ageInput, "Age must be a whole number.");
  if (Number(value) < 5 || Number(value) > 60)
    return setError(ageInput, "Age must be between 5 and 60.");
  return setError(ageInput, "");
}

function validateCourse() {
  if (courseInput.value === "") return setError(courseInput, "Please select a course.");
  return setError(courseInput, "");
}

// Block numbers and symbols while typing in the name box
nameInput.addEventListener("input", () => {
  nameInput.value = nameInput.value.replace(/[^A-Za-z ]/g, "");
  validateName();
});
emailInput.addEventListener("input", validateEmail);
ageInput.addEventListener("input", validateAge);
courseInput.addEventListener("change", validateCourse);

/* ---------- Table ---------- */
function render() {
  const keyword = searchBox.value.toLowerCase();
  const list = students.filter(s =>
    s.name.toLowerCase().includes(keyword) ||
    s.course.toLowerCase().includes(keyword)
  );

  tableBody.innerHTML = "";
  list.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.age}</td>
      <td>${s.course}</td>
      <td>
        <button class="edit-btn" onclick="editStudent(${s.id})">Edit</button>
        <button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
      </td>`;
    tableBody.appendChild(row);
  });

  emptyMsg.style.display = list.length ? "none" : "block";
  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("courseCount").textContent =
    new Set(students.map(s => s.course)).size;
}

/* ---------- Form submit ---------- */
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Run all checks (don't stop at the first failure so every error shows)
  const results = [validateName(), validateEmail(), validateAge(), validateCourse()];
  if (results.includes(false)) return;

  const data = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: ageInput.value,
    course: courseInput.value
  };

  if (editId === null) {
    const id = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
    students.push({ id, ...data });
  } else {
    students = students.map(s => (s.id === editId ? { id: editId, ...data } : s));
    editId = null;
    formTitle.textContent = "Add student";
    saveBtn.textContent = "Add student";
  }

  save();
  render();
  form.reset();
  [nameInput, emailInput, ageInput, courseInput].forEach(i => setError(i, ""));
});

function editStudent(id) {
  const s = students.find(st => st.id === id);
  nameInput.value = s.name;
  emailInput.value = s.email;
  ageInput.value = s.age;
  courseInput.value = s.course;
  [nameInput, emailInput, ageInput, courseInput].forEach(i => setError(i, ""));
  editId = id;
  formTitle.textContent = "Edit student";
  saveBtn.textContent = "Save changes";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteStudent(id) {
  if (confirm("Delete this student?")) {
    students = students.filter(s => s.id !== id);
    save();
    render();
  }
}

searchBox.addEventListener("input", render);

render();