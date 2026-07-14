import { useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

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
  const [jobs, setJobs] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const readFile = (file, setter, fileNameSetter) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target.result || "");
      fileNameSetter(file.name);
    };
    reader.readAsText(file);
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

      const jobsResponse = await fetch(`${API_BASE_URL}/jobs?job_description=${encodeURIComponent(jobDescriptionText)}`);
      const jobsData = await jobsResponse.json().catch(() => []);
      setJobs(jobsData);
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const experienceMatch = experienceFilter === "All" || job.experience === experienceFilter;
      const locationMatch = locationFilter === "All" || job.location === locationFilter;
      return experienceMatch && locationMatch;
    });
  }, [jobs, experienceFilter, locationFilter]);

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">AI-powered career assistant</p>
          <h1>AI Resume Builder</h1>
          <p>Create ATS-friendly resumes, review them instantly, and explore relevant opportunities.</p>
        </div>
      </header>

      <section className="grid-layout">
        <div className="card">
          <h2>Upload Profile</h2>
          <input
            type="file"
            accept=".txt"
            onChange={(event) => readFile(event.target.files[0], setStudentProfileText, setStudentFileName)}
          />
          {studentFileName ? <p className="file-name">Loaded: {studentFileName}</p> : <p className="file-name">No file selected yet.</p>}
        </div>

        <div className="card">
          <h2>Upload Job Description</h2>
          <input
            type="file"
            accept=".txt"
            onChange={(event) => readFile(event.target.files[0], setJobDescriptionText, setJobFileName)}
          />
          {jobFileName ? <p className="file-name">Loaded: {jobFileName}</p> : <p className="file-name">No file selected yet.</p>}
        </div>
      </section>

      <div className="actions-row">
        <button className="primary-btn" onClick={generateResume} disabled={loading}>
          {loading ? "Generating..." : "Generate Resume"}
        </button>
        {resume && (
          <>
            <button className="secondary-btn" onClick={() => downloadFile(resume, "resume.md")}>Download Resume</button>
            <button className="secondary-btn" onClick={() => downloadFile(atsReport, "ats_report.md")}>Download ATS Report</button>
          </>
        )}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {resume ? (
        <section className="results-grid">
          <article className="card result-card">
            <div className="section-heading">
              <h2>Generated Resume</h2>
              <button className="secondary-btn" onClick={() => downloadFile(improvementPlan, "improvement_plan.md")}>Download Plan</button>
            </div>
            <pre>{resume}</pre>
          </article>

          <article className="card result-card">
            <h2>ATS Report</h2>
            <pre>{atsReport}</pre>
          </article>

          <article className="card result-card">
            <h2>Improvement Plan</h2>
            <pre>{improvementPlan}</pre>
          </article>
        </section>
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