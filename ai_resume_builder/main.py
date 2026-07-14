from pathlib import Path
import logging
import re
from typing import Dict

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger("resume_builder")

BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"


def read_file(path: Path) -> str:
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def extract_keywords(text: str) -> list[str]:
    tokens = re.findall(r"[A-Za-z+#.]+", text.lower())
    stop_words = {
        "the",
        "and",
        "with",
        "for",
        "from",
        "you",
        "your",
        "this",
        "that",
        "about",
        "role",
        "team",
        "will",
        "have",
        "into",
        "our",
        "their",
        "are",
        "was",
        "been",
        "job",
        "company",
        "global",
        "data",
    }
    return [token for token in tokens if token not in stop_words and len(token) > 2]


def build_resume(profile: str, job_description: str) -> str:
    name = "Candidate"
    profile_lines = [line.strip() for line in profile.splitlines() if line.strip()]
    for line in profile_lines:
        if line.lower().startswith("name:"):
            name = line.split(":", 1)[1].strip() or name
            break

    skills = []
    for line in profile_lines:
        if line.lower().startswith("skills:"):
            continue
        if line.lower().startswith("projects:"):
            break
        if line.lower().startswith("education") or line.lower().startswith("experience"):
            continue
        if line and not line.startswith("Name:") and not line.startswith("Education"):
            skills.append(line)

    skills = [skill for skill in skills if skill.lower() not in {"python", "c++", "sql", "git", "html", "css", "javascript", "machine learning"}]
    skill_summary = ", ".join(skills[:6]) or "Python, SQL, Web Development"

    role = "Software Engineering"
    title_match = re.search(r"(?i)(machine learning|software|data|ai|developer|engineer|analyst|manager)", job_description)
    if title_match:
        role = title_match.group(1).title()

    return f"""# {name}

## Professional Summary
Highly motivated candidate with a solid foundation in computer science and emerging AI technologies. Skilled in problem solving, software development, and building practical solutions for modern business problems. Strong fit for {role} opportunities with a focus on quality, collaboration, and continuous learning.

## Technical Skills
- Python
- SQL
- Git
- Web Development
- Machine Learning
- {skill_summary}

## Education
- B.Tech Computer Science and Engineering (AI & ML)
- NIELIT Ropar

## Projects
- AI Resume Builder: Built an AI-assisted application for resume generation and ATS evaluation.
- Smart Waste Management System: Designed a data-driven solution for waste tracking and management.

## Experience
- Fresher with hands-on academic and project experience in Python, AI, and software engineering.
- Collaborated on team-based development tasks involving coding, documentation, and testing.

## Certifications
- Cisco Python Essentials 1 & 2
"""


def build_ats_report(profile: str, job_description: str) -> str:
    profile_keywords = set(extract_keywords(profile))
    job_keywords = set(extract_keywords(job_description))
    overlap = sorted(profile_keywords & job_keywords)
    match_score = min(100, 45 + (len(overlap) * 3))

    missing_skills = [keyword for keyword in sorted(job_keywords) if keyword not in profile_keywords][:8]
    matching_skills = overlap[:8]

    return f"""# ATS Report

- Score: {match_score}/100
- Keywords matched: {', '.join(matching_skills) if matching_skills else 'core technical concepts'}
- Missing skills to improve: {', '.join(missing_skills) if missing_skills else 'none identified'}
- Strengths: Strong academic foundation, project experience, and familiarity with Python and engineering workflows.
- Weaknesses: Limited direct leadership experience and some role-specific keywords need stronger emphasis.
"""


def build_improvement_plan(profile: str, job_description: str) -> str:
    profile_keywords = set(extract_keywords(profile))
    job_keywords = set(extract_keywords(job_description))
    missing_skills = [keyword for keyword in sorted(job_keywords) if keyword not in profile_keywords][:8]

    return """# Improvement Plan

1. Strengthen ATS keywords by adding role-specific terms to the resume summary and skill section.
2. Add measurable project outcomes and metrics for each listed project.
3. Highlight leadership, teamwork, and deployment experience wherever possible.
4. Build practical depth in the following areas:
   - """ + (", ".join(missing_skills) if missing_skills else "core domain skills") + """
5. Continue practicing technical interviews and resume tailoring for each target role.
"""


def generate_outputs(profile: str, job_description: str) -> Dict[str, str]:
    ensure_output_dir()
    resume_text = build_resume(profile, job_description)
    ats_report_text = build_ats_report(profile, job_description)
    improvement_plan_text = build_improvement_plan(profile, job_description)

    (OUTPUT_DIR / "resume.md").write_text(resume_text, encoding="utf-8")
    (OUTPUT_DIR / "ats_report.md").write_text(ats_report_text, encoding="utf-8")
    (OUTPUT_DIR / "improvement_plan.md").write_text(improvement_plan_text, encoding="utf-8")

    logger.info("Generated resume, ATS report, and improvement plan successfully.")
    return {
        "resume": resume_text,
        "ats_report": ats_report_text,
        "improvement_plan": improvement_plan_text,
    }


def main() -> None:
    profile_path = INPUT_DIR / "student_profile.txt"
    job_description_path = INPUT_DIR / "job_description.txt"

    profile = read_file(profile_path) if profile_path.exists() else ""
    job_description = read_file(job_description_path) if job_description_path.exists() else ""
    generate_outputs(profile, job_description)


if __name__ == "__main__":
    main()