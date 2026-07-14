from pathlib import Path
import subprocess
import sys

from fastapi import FastAPI, HTTPException

# Create the FastAPI application instance
app = FastAPI(title="AI Resume Builder API")

# Base folder for this project
BASE_DIR = Path(__file__).resolve().parent


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "AI Resume Builder API is Running"}


# Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}


# Generate Resume
@app.post("/generate-resume")
def generate_resume():
    print("=================================================", flush=True)
    print(">>> REQUEST RECEIVED <<<", flush=True)
    print(">>> STARTING MAIN.PY <<<", flush=True)

    try:
        # Run main.py
        result = subprocess.run(
            [sys.executable, "main.py"],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            check=False,
        )

        print(">>> MAIN.PY FINISHED <<<", flush=True)
        print(f"Return Code: {result.returncode}", flush=True)

        print("--------------- STDOUT ---------------", flush=True)
        print(result.stdout, flush=True)

        print("--------------- STDERR ---------------", flush=True)
        print(result.stderr, flush=True)

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Resume generation failed:\n{result.stderr or result.stdout}",
            )

        output_dir = BASE_DIR / "output"

        resume_path = output_dir / "resume.md"
        ats_report_path = output_dir / "ats_report.md"
        improvement_plan_path = output_dir / "improvement_plan.md"

        print("Checking output files...", flush=True)
        print(f"resume.md exists: {resume_path.exists()}", flush=True)
        print(f"ats_report.md exists: {ats_report_path.exists()}", flush=True)
        print(f"improvement_plan.md exists: {improvement_plan_path.exists()}", flush=True)

        if not (
            resume_path.exists()
            and ats_report_path.exists()
            and improvement_plan_path.exists()
        ):
            raise HTTPException(
                status_code=500,
                detail="One or more output files were not created.",
            )

        print(">>> RETURNING JSON <<<", flush=True)

        return {
            "resume": resume_path.read_text(encoding="utf-8"),
            "ats_report": ats_report_path.read_text(encoding="utf-8"),
            "improvement_plan": improvement_plan_path.read_text(encoding="utf-8"),
        }

    except FileNotFoundError as exc:
        print(f"FileNotFoundError: {exc}", flush=True)
        raise HTTPException(status_code=500, detail=str(exc))

    except Exception as exc:
        print(f"Unexpected Exception: {exc}", flush=True)
        raise HTTPException(status_code=500, detail=str(exc))