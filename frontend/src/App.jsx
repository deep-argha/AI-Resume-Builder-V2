import "./App.css";

function App() {
  return (
    <div className="container">
      <h1>AI Resume Builder</h1>
      <p>Create ATS-Friendly Resumes with AI</p>

      <div className="card">
        <h2>Student Profile</h2>
        <input type="file" />
      </div>

      <div className="card">
        <h2>Job Description</h2>
        <input type="file" />
      </div>

      <button className="generate-btn">
        Generate Resume
      </button>
    </div>
  );
}

export default App;