import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/students";
const emptyForm = {
  name: "", rollNumber: "", department: "Information Technology", year: "Second Year",
  email: "", skills: "", classesAttended: 0, totalClasses: 0, marks: 0
};

function attendance(student) {
  return student.totalClasses ? Math.round((student.classesAttended / student.totalClasses) * 100) : 0;
}

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStudents(term = search) {
    try {
      setLoading(true);
      const response = await fetch(`${API}?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load students.");
      setStudents(data);
    } catch (error) {
      setMessage(`${error.message} Is the backend running and MongoDB connected?`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStudents(""); }, []);
  useEffect(() => {
    const timer = setTimeout(() => loadStudents(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = useMemo(() => ({
    total: students.length,
    attendance: students.length
      ? Math.round(students.reduce((sum, s) => sum + attendance(s), 0) / students.length)
      : 0,
    support: students.filter(s => attendance(s) < 75 || Number(s.marks) < 40).length,
    marks: students.length
      ? Math.round(students.reduce((sum, s) => sum + Number(s.marks || 0), 0) / students.length)
      : 0
  }), [students]);

  function changeField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function submitForm(event) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      classesAttended: Number(form.classesAttended),
      totalClasses: Number(form.totalClasses),
      marks: Number(form.marks)
    };
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save student.");
      setMessage(editingId ? "Student updated successfully." : "Student added successfully.");
      resetForm();
      await loadStudents(search);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editStudent(student) {
    setEditingId(student._id);
    setForm({
      name: student.name || "", rollNumber: student.rollNumber || "",
      department: student.department || "Information Technology", year: student.year || "Second Year",
      email: student.email || "", skills: student.skills || "",
      classesAttended: student.classesAttended ?? 0, totalClasses: student.totalClasses ?? 0,
      marks: student.marks ?? 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.name} (${student.rollNumber})?`)) return;
    try {
      const response = await fetch(`${API}/${student._id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to delete student.");
      setMessage("Student deleted.");
      await loadStudents(search);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        
        <div className="brand"><div className="brand-mark">CP</div><div><strong>CampusPlus</strong><span>SMART STUDENT HUB</span></div></div>
        <div className="side-label">WORKSPACE</div>
        <a className="nav-item active" href="#overview"><span>▦</span> Overview</a>
        <a className="nav-item" href="#students"><span>♙</span> Students</a>
        <a className="nav-item" href="#add-student"><span>＋</span> Add student</a>
        <div className="sidebar-note"><div className="note-icon">✦</div><strong>Small steps, real progress.</strong><p>Keep student records organized and spot who may need support.</p></div>
        <div className="sidebar-footer"><div className="avatar">A</div><div><strong>Administrator</strong><span>Campus workspace</span></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><div className="eyebrow">YOUR CAMPUS AT A GLANCE</div><h1>Student overview</h1><p className="subheading">A clearer view of student progress starts here.</p></div>
          <a className="primary-button top-add" href="#add-student">＋ Add student</a>
        </header>

        <section className="stats-grid" id="overview">
          <article className="stat-card"><div className="stat-top"><span>Total students</span><span className="stat-icon lilac">♙</span></div><div className="stat-number">{stats.total}</div><div className="stat-caption">Students in your workspace</div></article>
          <article className="stat-card"><div className="stat-top"><span>Average attendance</span><span className="stat-icon mint">◷</span></div><div className="stat-number">{stats.attendance}<small>%</small></div><div className="stat-caption">Across the visible student list</div></article>
          <article className="stat-card"><div className="stat-top"><span>Need attention</span><span className="stat-icon peach">!</span></div><div className="stat-number">{stats.support}</div><div className="stat-caption">Low attendance or marks</div></article>
          <article className="stat-card"><div className="stat-top"><span>Average marks</span><span className="stat-icon blue">↗</span></div><div className="stat-number">{stats.marks}<small>/100</small></div><div className="stat-caption">Average recorded score</div></article>
        </section>

        {message && <div className={`message ${message.toLowerCase().includes("success") || message.toLowerCase().includes("deleted") ? "success" : ""}`} role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}

        <section className="content-grid">
          <div className="panel student-panel" id="students">
            <div className="panel-heading"><div><h2>Student directory</h2><p>Find students and review their progress.</p></div><span className="count-pill">{students.length} records</span></div>
            <div className="search-row"><span className="search-symbol">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, roll number, department..." aria-label="Search students" /></div>
            {loading ? <div className="empty-state">Loading student records…</div> : students.length === 0 ? <div className="empty-state"><div className="empty-icon">♙</div><strong>No students found</strong><p>Add a student using the form or try another search.</p></div> : (
              <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ATTENDANCE</th><th>MARKS</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>{students.map(student => {
                  const percent = attendance(student);
                  const needsHelp = percent < 75 || Number(student.marks) < 40;
                  return <tr key={student._id}>
                    <td><div className="student-cell"><div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div><div><strong>{student.name}</strong><span>{student.rollNumber} · {student.department}</span></div></div></td>
                    <td><div className="attendance-cell"><strong>{percent}%</strong><div className="progress-track"><div className={`progress-fill ${percent < 75 ? "low" : ""}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div></div></td>
                    <td><strong>{student.marks}/100</strong></td>
                    <td><span className={`status ${needsHelp ? "needs-help" : "on-track"}`}>{needsHelp ? "Needs support" : "On track"}</span></td>
                    <td><div className="actions"><button className="icon-button" title="Edit student" onClick={() => editStudent(student)}>✎</button><button className="icon-button delete" title="Delete student" onClick={() => deleteStudent(student)}>×</button></div></td>
                  </tr>;
                })}</tbody></table></div>
            )}
            <div className="table-foot">Tip: students below 75% attendance or 40 marks are flagged for review.</div>
          </div>

          <aside className="panel form-panel" id="add-student">
            <div className="panel-heading"><div><h2>{editingId ? "Edit student" : "Add a student"}</h2><p>{editingId ? "Update the student's details." : "Create a new student profile."}</p></div><span className="form-spark">✦</span></div>
            <form onSubmit={submitForm}>
              <label>Full name<input name="name" value={form.name} onChange={changeField} placeholder="e.g. Aanya Sharma" required /></label>
              <div className="form-row"><label>Roll number<input name="rollNumber" value={form.rollNumber} onChange={changeField} placeholder="e.g. IT024" required /></label><label>Year<select name="year" value={form.year} onChange={changeField}><option>First Year</option><option>Second Year</option><option>Third Year</option><option>Final Year</option></select></label></div>
              <label>Department<select name="department" value={form.department} onChange={changeField}><option>Information Technology</option><option>Computer Engineering</option><option>Artificial Intelligence</option><option>Electronics</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Other</option></select></label>
              <label>Email address <span className="optional">OPTIONAL</span><input name="email" type="email" value={form.email} onChange={changeField} placeholder="student@example.com" /></label>
              <label>Skills <span className="optional">OPTIONAL</span><input name="skills" value={form.skills} onChange={changeField} placeholder="React, Python, teamwork..." /></label>
              <div className="form-row"><label>Classes attended<input name="classesAttended" type="number" min="0" value={form.classesAttended} onChange={changeField} required /></label><label>Total classes<input name="totalClasses" type="number" min="0" value={form.totalClasses} onChange={changeField} required /></label></div>
              <label>Marks (out of 100)<input name="marks" type="number" min="0" max="100" value={form.marks} onChange={changeField} required /></label>
              <div className="form-actions"><button className="primary-button submit-button" type="submit">{editingId ? "Save changes" : "Create student"} <span>→</span></button>{editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}</div>
            </form>
          </aside>
        </section>
        <footer className="page-footer"><span>CampusPulse <span className="footer-dot">•</span> Student progress, made clearer.</span><span>Built with React · Express · MongoDB</span></footer>
      </main>
    </div>
  );
}

export default App;
