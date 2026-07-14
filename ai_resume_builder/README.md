# AI Resume Builder

This project now provides a working end-to-end resume builder experience with a Python backend, a React frontend, ATS-style output files, and a simple job recommendation section.

## What it does

- Reads a student profile and a job description
- Generates a tailored ATS-friendly resume in Markdown
- Produces an ATS report with a score and improvement notes
- Creates an improvement plan for career growth
- Exposes a FastAPI endpoint for frontend integration
- Provides a Vite-based React UI for uploading content and viewing results

## Project structure

```text
ai_resume_builder/
├── main.py
├── api.py
├── agents.py
├── crew.py
├── tasks.py
├── requirements.txt
├── input/
│   ├── student_profile.txt
│   └── job_description.txt
├── output/
│   ├── resume.md
│   ├── ats_report.md
│   └── improvement_plan.md
frontend/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── package.json
```

## Run the backend

From the project root:

```bash
cd ai_resume_builder
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

To start the API server:

```bash
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

## Run the frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Then open the Vite URL shown in the terminal.

## Notes

- The project now avoids hanging on CrewAI/Ollama calls by falling back to a deterministic generation path when the model backend is unavailable.
- The frontend sends the uploaded text to the backend through the POST /generate-resume endpoint.
- Output files are written to the output folder automatically.

