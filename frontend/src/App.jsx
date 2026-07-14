import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const parseAtsReport = (report = "") => {
  const normalizeList = (value = "") =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const scoreMatch = report.match(/score:\s*(\d+)/i);
  const keywordMatch = report.match(/keyword match:\s*(\d+)/i);
  const matchingSkillsMatch = report.match(/matching skills:\s*(.+)/i);
  const missingSkillsMatch = report.match(/missing skills to improve:\s*(.+)/i);

  return {
    score: Number(scoreMatch?.[1] ?? 0),
    keywordMatch: Number(keywordMatch?.[1] ?? 0),
    matchingSkills: normalizeList(matchingSkillsMatch?.[1] ?? ""),
    missingSkills: normalizeList(missingSkillsMatch?.[1] ?? ""),
  };
};

function App() {
  const [studentProfileText, setStudentProfileText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [studentFileName, setStudentFileName] = useState("");
  const [jobFileName, setJobFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] = useState("");
  const [atsReport, setAtsReport] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [linkedinAbout, setLinkedinAbout] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState({ hr: [], technical: [], behavioral: [], project: [] });
  const [skillsGap, setSkillsGap] = useState(null);
  const [resumeMatch, setResumeMatch] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [remoteFilter, setRemoteFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return Boolean(localStorage.getItem("auth"));
    } catch {
      return false;
    }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [dragActive, setDragActive] = useState(null);
  const [atsMetrics, setAtsMetrics] = useState({ score: 0, keywordMatch: 0, matchingSkills: [], missingSkills: [] });

  const scoreValue = Number(atsMetrics.score || skillsGap?.score || 0);
  const keywordMatch = Number(atsMetrics.keywordMatch || skillsGap?.keyword_match_percentage || 0);
  const skillPercentage = Number(skillsGap?.skill_percentage ?? 0);
  const missingSkills = atsMetrics.missingSkills.length > 0 ? atsMetrics.missingSkills : (skillsGap?.missing_skills ?? []);
  const recommendedCertifications = skillsGap?.recommended_certifications ?? [];
  const learningRoadmap = skillsGap?.learning_roadmap ?? [];
  const recommendations = skillsGap?.recommendations ?? resumeMatch?.recommendations ?? [];
  const matchingSkills = skillsGap?.matching_skills ?? resumeMatch?.matching_skills ?? [];
  const currentSkills = skillsGap?.current_skills ?? [];
  const atsMatchingSkills = atsMetrics.matchingSkills.length > 0 ? atsMetrics.matchingSkills : matchingSkills;

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch {
      // Ignore storage issues.
    }
  }, [isDarkMode]);

  const readFile = (file, setter, fileNameSetter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target.result || "");
      fileNameSetter(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (event, type) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (type === "profile") {
        readFile(file, setStudentProfileText, setStudentFileName);
      } else {
        readFile(file, setJobDescriptionText, setJobFileName);
      }
    }
  };

  const handleAuth = () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setError("Email and password are required.");
      return;
    }
    try {
      localStorage.setItem("auth", JSON.stringify({ email: authEmail.trim(), name: authName.trim() || "User" }));
    } catch {
      // Ignore storage issues.
    }
    setIsAuthenticated(true);
    setError("");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("auth");
    } catch {
      // Ignore storage issues.
    }
    setIsAuthenticated(false);
    setError("");
  };

  const generateResume = async () => {
    if (!studentProfileText.trim() || !jobDescriptionText.trim()) {
      setError("Please upload both a student profile and a job description file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/generate-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_profile: studentProfileText,
          job_description: jobDescriptionText,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Generation failed.");
      }

      setResume(data.resume || "");
      setAtsReport(data.ats_report || "");
      setImprovementPlan(data.improvement_plan || "");
      setCoverLetter(data.cover_letter || "");
      setLinkedinAbout(data.linkedin_about || "");
      setInterviewQuestions(data.interview_questions || { hr: [], technical: [], behavioral: [], project: [] });
      setSkillsGap(data.skills_gap || null);
      setResumeMatch(data.resume_match || null);
      setAtsMetrics(parseAtsReport(data.ats_report || ""));

      const jobsResponse = await fetch(`${API_BASE_URL}/jobs?job_description=${encodeURIComponent(jobDescriptionText)}`);
      const jobsData = await jobsResponse.json().catch(() => []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content, filename) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (content) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const experienceMatch = experienceFilter === "All" || job.experience === experienceFilter;
        const locationMatch = locationFilter === "All" || job.location === locationFilter;
        const remoteMatch = remoteFilter === "All" || (remoteFilter === "Remote" ? job.location === "Remote" : job.location !== "Remote");
        const scoreMatch = matchFilter === "All" || job.match_score >= Number(matchFilter);
        return experienceMatch && locationMatch && remoteMatch && scoreMatch;
      })
      .sort((a, b) => (sortOrder === "desc" ? b.match_score - a.match_score : a.match_score - b.match_score));
  }, [jobs, experienceFilter, locationFilter, remoteFilter, matchFilter, sortOrder]);

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-topbar">
          <div>
            <p className="eyebrow">AI-powered career assistant</p>
            <h1>AI Resume Builder</h1>
            <p>Create ATS-friendly resumes, review them instantly, and explore relevant opportunities.</p>
          </div>
          <div className="hero-actions">
            <button className="secondary-btn" onClick={() => setIsDarkMode((value) => !value)}>{isDarkMode ? "☀️ Light" : "🌙 Dark"}</button>
            {isAuthenticated ? <button className="secondary-btn" onClick={handleLogout}>Logout</button> : null}
          </div>
        </div>
      </header>

      <section className="card auth-card">
        <h2>Access the Dashboard</h2>
        <div className="auth-toggle">
          <button className={authMode === "login" ? "primary-btn" : "secondary-btn"} onClick={() => setAuthMode("login")}>Login</button>
          <button className={authMode === "register" ? "primary-btn" : "secondary-btn"} onClick={() => setAuthMode("register")}>Register</button>
        </div>
        {authMode === "register" ? <input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Full name" /> : null}
        <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" />
        <button className="primary-btn" onClick={handleAuth}>{authMode === "login" ? "Login" : "Register"}</button>
        {isAuthenticated ? <p className="file-name">Signed in as {authEmail || "saved user"}</p> : null}
      </section>

      <section className="grid-layout">
        <div className={`card upload-card ${dragActive ? "drag-active" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(e) => handleDrop(e, "profile")}>
          <h2>Upload Profile</h2>
          <input type="file" accept=".txt" onChange={(event) => readFile(event.target.files[0], setStudentProfileText, setStudentFileName)} />
          {studentFileName ? <p className="file-name">Loaded: {studentFileName}</p> : <p className="file-name">Drop a .txt file here or click to browse.</p>}
        </div>

        <div className={`card upload-card ${dragActive ? "drag-active" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(e) => handleDrop(e, "job")}>
          <h2>Upload Job Description</h2>
          <input type="file" accept=".txt" onChange={(event) => readFile(event.target.files[0], setJobDescriptionText, setJobFileName)} />
          {jobFileName ? <p className="file-name">Loaded: {jobFileName}</p> : <p className="file-name">Drop a .txt file here or click to browse.</p>}
        </div>
      </section>

      <div className="actions-row">
        <button className="primary-btn" onClick={generateResume} disabled={loading}>{loading ? "Generating..." : "Generate Resume"}</button>
        {resume ? (
          <>
            <button className="secondary-btn" onClick={() => downloadFile(resume, "resume.md")}>Markdown Resume</button>
            <button className="secondary-btn" onClick={() => downloadFile(atsReport, "ats_report.md")}>ATS Report</button>
            <button className="secondary-btn" onClick={() => downloadFile(improvementPlan, "improvement_plan.md")}>Improvement Plan</button>
            <button className="secondary-btn" onClick={() => downloadFile(coverLetter, "cover_letter.md")}>Cover Letter</button>
          </>
        ) : null}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {resume ? (
        <>
          <section className="results-grid">
            <article className="card result-card">
              <div className="section-heading">
                <h2>Generated Resume</h2>
                <button className="secondary-btn" onClick={() => downloadFile(resume, "resume.md")}>Download</button>
              </div>
              <pre>{resume}</pre>
            </article>

            <article className="card result-card">
              <h2>ATS Score Overview</h2>
              <div className="score-ring" style={{ "--score": scoreValue }}>
                <div className="score-ring-inner">
                  <strong>{scoreValue}</strong>
                  <span>/100</span>
                </div>
              </div>
              <div className="progress-row"><span>Keyword Match</span><div className="progress-bar"><div style={{ width: `${keywordMatch}%` }} /></div><strong>{keywordMatch}%</strong></div>
              <div className="progress-row"><span>Overall Rating</span><div className="progress-bar"><div style={{ width: `${Math.min(100, scoreValue)}%` }} /></div><strong>{scoreValue}/100</strong></div>
            </article>

            <article className="card result-card">
              <h2>Improvement Plan Dashboard</h2>
              <h3>Missing Skills</h3>
              <ul>{missingSkills.length > 0 ? missingSkills.map((skill) => <li key={skill}>{skill}</li>) : <li>No missing skills detected.</li>}</ul>
              <h3>Recommended Certifications</h3>
              <ul>{recommendedCertifications.length > 0 ? recommendedCertifications.map((cert) => <li key={cert}>{cert}</li>) : <li>No recommendations yet.</li>}</ul>
              <h3>Roadmap</h3>
              <ul>{learningRoadmap.length > 0 ? learningRoadmap.map((item) => <li key={item}>{item}</li>) : <li>No roadmap available.</li>}</ul>
              <h3>Recommendations</h3>
              <ul>{recommendations.length > 0 ? recommendations.map((item) => <li key={item}>{item}</li>) : <li>No recommendations yet.</li>}</ul>
            </article>
          </section>

          <section className="results-grid">
            <article className="card result-card">
              <h2>Skills Gap Dashboard</h2>
              <div className="pill-row">
                <span className="pill">Current Skills: {currentSkills.length > 0 ? currentSkills.join(", ") : "None"}</span>
                <span className="pill">Matching Skills: {matchingSkills.length > 0 ? matchingSkills.join(", ") : "None"}</span>
              </div>
              <div className="progress-row"><span>Skill Percentage</span><div className="progress-bar"><div style={{ width: `${skillPercentage}%` }} /></div><strong>{skillPercentage}%</strong></div>
              <h3>Recommended Certifications</h3>
              <ul>{recommendedCertifications.length > 0 ? recommendedCertifications.map((item) => <li key={item}>{item}</li>) : <li>No certifications yet.</li>}</ul>
            </article>

            <article className="card result-card">
              <h2>Resume Match Score</h2>
              <div className="score-ring" style={{ "--score": Number(resumeMatch?.overall_match_percentage ?? 0) }}>
                <div className="score-ring-inner">
                  <strong>{resumeMatch?.overall_match_percentage ?? 0}</strong>
                  <span>%</span>
                </div>
              </div>
              <h3>Matching Skills</h3>
              <ul>{matchingSkills.length > 0 ? matchingSkills.map((skill) => <li key={skill}>{skill}</li>) : <li>No matching skills yet.</li>}</ul>
              <h3>Missing Skills</h3>
              <ul>{missingSkills.length > 0 ? missingSkills.map((skill) => <li key={skill}>{skill}</li>) : <li>No missing skills yet.</li>}</ul>
              <h3>Recommendations</h3>
              <ul>{recommendations.length > 0 ? recommendations.map((item) => <li key={item}>{item}</li>) : <li>No recommendations yet.</li>}</ul>
            </article>

            <article className="card result-card">
              <h2>Cover Letter</h2>
              <pre>{coverLetter || "Generate a resume to create a cover letter."}</pre>
              <div className="actions-row">
                <button className="secondary-btn" onClick={() => copyToClipboard(coverLetter)}>Copy</button>
                <button className="secondary-btn" onClick={() => downloadFile(coverLetter, "cover_letter.md")}>Download</button>
              </div>
            </article>
          </section>

          <section className="results-grid">
            <article className="card result-card">
              <h2>LinkedIn About Section</h2>
              <pre>{linkedinAbout || "Generate a resume to create a LinkedIn About section."}</pre>
              <div className="actions-row">
                <button className="secondary-btn" onClick={() => copyToClipboard(linkedinAbout)}>Copy</button>
                <button className="secondary-btn" onClick={() => downloadFile(linkedinAbout, "linkedin_about.md")}>Download</button>
              </div>
            </article>

            <article className="card result-card">
              <h2>Interview Questions</h2>
              <h3>HR</h3>
              <ul>{(interviewQuestions.hr || []).length > 0 ? interviewQuestions.hr.map((item) => <li key={item}>{item}</li>) : <li>No HR questions yet.</li>}</ul>
              <h3>Technical</h3>
              <ul>{(interviewQuestions.technical || []).length > 0 ? interviewQuestions.technical.map((item) => <li key={item}>{item}</li>) : <li>No technical questions yet.</li>}</ul>
              <h3>Behavioral</h3>
              <ul>{(interviewQuestions.behavioral || []).length > 0 ? interviewQuestions.behavioral.map((item) => <li key={item}>{item}</li>) : <li>No behavioral questions yet.</li>}</ul>
              <h3>Project</h3>
              <ul>{(interviewQuestions.project || []).length > 0 ? interviewQuestions.project.map((item) => <li key={item}>{item}</li>) : <li>No project questions yet.</li>}</ul>
            </article>
          </section>
        </>
      ) : null}

      {jobs.length > 0 ? (
        <section className="card">
          <div className="section-heading">
            <h2>Recommended Jobs</h2>
            <div className="filters">
              <select value={experienceFilter} onChange={(event) => setExperienceFilter(event.target.value)}>
                <option value="All">All Experience</option>
                <option value="3+ years">3+ years</option>
                <option value="4+ years">4+ years</option>
                <option value="12+ years">12+ years</option>
              </select>
              <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                <option value="All">All Locations</option>
                <option value="Bangalore, India">Bangalore, India</option>
                <option value="Hyderabad, India">Hyderabad, India</option>
                <option value="Remote">Remote</option>
              </select>
              <select value={remoteFilter} onChange={(event) => setRemoteFilter(event.target.value)}>
                <option value="All">All Work Modes</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid/Onsite</option>
              </select>
              <select value={matchFilter} onChange={(event) => setMatchFilter(event.target.value)}>
                <option value="All">All Match Scores</option>
                <option value="80">80%+</option>
                <option value="90">90%+</option>
              </select>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="desc">Highest Match</option>
                <option value="asc">Lowest Match</option>
              </select>
            </div>
          </div>

          <div className="job-list">
            {filteredJobs.map((job) => (
              <div key={`${job.company}-${job.title}`} className="job-item">
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                </div>
                <div>
                  <p>{job.location}</p>
                  <p>Experience: {job.experience}</p>
                  <p>Salary: {job.salary || "Not listed"}</p>
                  <p>Match: {job.match_score}%</p>
                  <a href={job.apply_link} target="_blank" rel="noreferrer">Apply</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default App;