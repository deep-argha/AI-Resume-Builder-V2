from pathlib import Path
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import generate_outputs

app = FastAPI(title="AI Resume Builder API")
BASE_DIR = Path(__file__).resolve().parent

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResumeRequest(BaseModel):
    student_profile: str
    job_description: str


@app.get("/")
def read_root():
    return {"message": "AI Resume Builder API is Running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/generate-resume")
def generate_resume(payload: ResumeRequest):
    if not payload.student_profile.strip() or not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Both profile and job description are required.")

    try:
        result = generate_outputs(payload.student_profile, payload.job_description)
        return {
            "resume": result["resume"],
            "ats_report": result["ats_report"],
            "improvement_plan": result["improvement_plan"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/jobs")
def search_jobs(job_description: str | None = None):
    description = job_description or ""
    keywords = re.findall(r"[A-Za-z+#.]+", description.lower())
    keyword_set = {k for k in keywords if len(k) > 2}

    jobs = [
        {
            "company": "Entrupy",
            "title": "Senior Director of Machine Learning",
            "location": "Bangalore, India",
            "experience": "12+ years",
            "match_score": 94,
            "apply_link": "https://www.linkedin.com/jobs/view/123456789",
        },
        {
            "company": "Google",
            "title": "Machine Learning Engineer",
            "location": "Hyderabad, India",
            "experience": "3+ years",
            "match_score": 87,
            "apply_link": "https://www.linkedin.com/jobs/view/987654321",
        },
        {
            "company": "Microsoft",
            "title": "Applied AI Engineer",
            "location": "Remote",
            "experience": "4+ years",
            "match_score": 82,
            "apply_link": "https://www.linkedin.com/jobs/view/456789123",
        },
    ]

    if keyword_set:
        for job in jobs:
            job["match_score"] = max(70, min(99, job["match_score"] - (2 if "lead" not in keyword_set else 0)))

    jobs.sort(key=lambda item: item["match_score"], reverse=True)
    return jobs