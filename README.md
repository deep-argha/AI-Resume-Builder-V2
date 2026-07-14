# AI Resume Builder V2

AI Resume Builder V2 is an AI-powered web application that generates ATS-friendly resumes, evaluates resume quality, identifies skill gaps, and recommends relevant job opportunities using AI.

---

# Project Features

- AI Resume Generation
- ATS Score Analysis
- ATS Score Visualization (Gauge and Progress Bars)
- Improvement Plan Dashboard
- Skills Gap Dashboard
- Resume Match Score
- Job Recommendation Dashboard
- Filter Jobs by Location
- Filter Jobs by Experience
- Cover Letter Generator
- LinkedIn About Generator
- Interview Question Generator
- Dark Mode
- User Authentication
- Drag & Drop Resume Upload
- Resume Download
- ATS Report Download
- Improvement Plan Download

---

# Technologies Used

## Frontend

- React.js
- Vite
- CSS

## Backend

- Python
- FastAPI

## AI Technologies

- CrewAI
- Ollama
- Llama 3.2

---

# Project Structure

```
AI-Resume-Builder-V2
│
├── ai_resume_builder
│   ├── api.py
│   ├── main.py
│   ├── agents.py
│   ├── crew.py
│   ├── tasks.py
│   ├── input
│   └── output
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
└── README.md
```

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/deep-argha/AI-Resume-Builder-V2.git
```

## Backend Setup

```bash
cd ai_resume_builder

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Usage

1. Upload the Student Profile.
2. Upload the Job Description.
3. Click **Generate Resume**.
4. View the generated:
   - Resume
   - ATS Score
   - ATS Dashboard
   - Improvement Plan
   - Skills Gap Dashboard
   - Resume Match Score
   - Cover Letter
   - LinkedIn About Section
   - Interview Questions
   - Recommended Jobs

---

# Screenshots

Add screenshots of the following sections:

- Home Page
- Generated Resume
- ATS Dashboard
- Improvement Plan Dashboard
- Skills Gap Dashboard
- Resume Match Score
- Cover Letter Generator
- LinkedIn About Generator
- Interview Questions
- Job Recommendation Dashboard

---

# Future Improvements

- LinkedIn API Integration
- Live Job Search API
- Resume Export as PDF
- Resume Export as DOCX
- Database Integration
- Cloud Deployment
- Email Resume Feature

---

# Author

**Arghadeep Das**

B.Tech Computer Science and Engineering (AI & ML)

National Institute of Electronics and Information Technology (NIELIT), Ropar

---

# Version

AI Resume Builder V2

Final Release