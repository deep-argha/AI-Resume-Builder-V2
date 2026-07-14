from pathlib import Path
import logging
import re
from typing import Any, Dict, List

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


def extract_keywords(text: str) -> List[str]:
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
        "india",
        "europe",
        "bengaluru",
        "bangalore",
        "hybrid",
    }
    return [token for token in tokens if token not in stop_words and len(token) > 2]


def extract_name(profile: str) -> str:
    for line in profile.splitlines():
        if line.lower().startswith("name:"):
            return line.split(":", 1)[1].strip() or "Candidate"
    return "Candidate"


def extract_profile_skills(profile: str) -> List[str]:
    match = re.search(r"skills:(.*?)(?=\n\s*(?:projects|experience|certifications|education|name):)", profile, re.I | re.S)
    if not match:
        return []

    skills = []
    for line in match.group(1).splitlines():
        cleaned = line.strip()
        if cleaned and not cleaned.lower().startswith("skills"):
            skills.append(cleaned)
    return skills


def normalize_skill(skill: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", skill.lower()).strip()


def build_resume(profile: str, job_description: str) -> str:
    name = extract_name(profile)
    profile_lines = [line.strip() for line in profile.splitlines() if line.strip()]
    skills = [skill for skill in extract_profile_skills(profile) if skill]
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


def build_ats_report(profile: str, job_description: str, skills_gap: Dict[str, Any]) -> str:
    score = skills_gap["score"]
    matching_skills = ", ".join(skills_gap["matching_skills"]) if skills_gap["matching_skills"] else "core technical concepts"
    missing_skills = ", ".join(skills_gap["missing_skills"]) if skills_gap["missing_skills"] else "none identified"

    return f"""# ATS Report

- Score: {score}/100
- Keyword match: {skills_gap['keyword_match_percentage']}%
- Matching skills: {matching_skills}
- Missing skills to improve: {missing_skills}
- Strengths: Strong academic foundation, project experience, and familiarity with Python and engineering workflows.
- Weaknesses: Limited direct leadership experience and some role-specific keywords need stronger emphasis.
"""


def build_improvement_plan(profile: str, job_description: str, skills_gap: Dict[str, Any]) -> str:
    roadmap = skills_gap["learning_roadmap"]
    recommendations = skills_gap["recommendations"]
    certifications = skills_gap["recommended_certifications"]

    roadmap_text = "\n".join(f"- {item}" for item in roadmap)
    recommendation_text = "\n".join(f"- {item}" for item in recommendations)
    certification_text = "\n".join(f"- {item}" for item in certifications)

    return f"""# Improvement Plan

## Missing Skills
{chr(10).join(f'- {skill}' for skill in skills_gap['missing_skills']) or '- None identified'}

## Certifications
{certification_text}

## Roadmap
{roadmap_text}

## Recommendations
{recommendation_text}
"""


def build_skills_gap(profile: str, job_description: str) -> Dict[str, Any]:
    job_text = job_description.lower()
    core_skills = [
        "python",
        "sql",
        "git",
        "machine learning",
        "computer vision",
        "deep learning",
        "tensorflow",
        "pytorch",
        "opencv",
        "leadership",
        "team management",
        "nlp",
        "cloud",
        "aws",
        "c++",
        "javascript",
        "html",
        "css",
    ]
    job_skills = [skill for skill in core_skills if skill in job_text]
    profile_skills = [normalize_skill(skill) for skill in extract_profile_skills(profile)]

    matching_skills = [skill for skill in job_skills if normalize_skill(skill) in profile_skills]
    missing_skills = [skill for skill in job_skills if normalize_skill(skill) not in profile_skills]

    keyword_match_percentage = round((len(matching_skills) / len(job_skills)) * 100) if job_skills else 0
    score = min(100, max(45, keyword_match_percentage + 20))

    recommended_certifications = []
    if "deep learning" in job_text or "tensorflow" in job_text or "pytorch" in job_text:
        recommended_certifications.append("TensorFlow Developer Certificate")
    if "computer vision" in job_text or "opencv" in job_text:
        recommended_certifications.append("OpenCV Computer Vision Specialization")
    if "leadership" in job_text or "team management" in job_text:
        recommended_certifications.append("Google Project Management Certificate")
    if not recommended_certifications:
        recommended_certifications.append("AWS Machine Learning Specialty")

    learning_roadmap = [
        "Strengthen core technical keywords in the resume summary and skills section.",
        "Build at least one portfolio project that demonstrates the missing technical skills.",
        "Add measurable achievements and leadership examples to the experience section.",
    ]

    recommendations = [
        "Add role-specific keywords that appear in the job description.",
        "Highlight leadership and collaboration examples clearly.",
        "Include project outcomes and metrics where possible.",
    ]

    return {
        "current_skills": [skill for skill in profile_skills if skill][:8],
        "matching_skills": [skill for skill in matching_skills][:8],
        "missing_skills": [skill for skill in missing_skills][:8],
        "skill_percentage": keyword_match_percentage,
        "recommended_certifications": recommended_certifications,
        "learning_roadmap": learning_roadmap,
        "recommendations": recommendations,
        "keyword_match_percentage": keyword_match_percentage,
        "score": score,
    }


def build_cover_letter(profile: str, job_description: str) -> str:
    name = extract_name(profile)
    role_match = re.search(r"(?i)(machine learning|software|data|ai|developer|engineer|analyst|manager)", job_description)
    role = role_match.group(1).title() if role_match else "Professional Role"

    return f"""Dear Hiring Manager,

I am excited to apply for the {role} position. I am a motivated and detail-oriented candidate with a strong foundation in computer science, machine learning, and software development. Through my academic projects and practical experience, I have developed the ability to think analytically, solve problems, and build useful software solutions.

I would welcome the opportunity to contribute my technical skills, adaptability, and enthusiasm to your team. I believe my background in Python, machine learning, and project-based development would allow me to add value quickly while continuing to grow in a collaborative environment.

Thank you for your time and consideration. I look forward to the opportunity to discuss how I can contribute to your organization.

Sincerely,
{name}
"""


def build_linkedin_about(profile: str, job_description: str) -> str:
    name = extract_name(profile)
    return f"""Hi, I’m {name}. I am a motivated software and AI-focused learner with a strong interest in building practical solutions using Python, machine learning, and modern web technologies. I enjoy solving problems, collaborating with teams, and turning ideas into useful products. I am continuously improving my skills through projects, certifications, and hands-on experience.
"""


def build_interview_questions() -> Dict[str, List[str]]:
    return {
        "hr": [
            "Tell me about yourself.",
            "Why do you want to work in this industry?",
            "How do you handle feedback and growth?",
        ],
        "technical": [
            "Explain the difference between supervised and unsupervised learning.",
            "How would you evaluate a machine learning model?",
            "What is the role of feature engineering?",
        ],
        "behavioral": [
            "Describe a time you worked in a team under pressure.",
            "How do you handle conflicting priorities?",
            "Tell me about a project where you had to learn something quickly.",
        ],
        "project": [
            "How would you improve your AI Resume Builder project?",
            "What challenges did you face while building your portfolio projects?",
            "How would you explain your most significant project to a recruiter?",
        ],
    }


def build_resume_match(profile: str, job_description: str, skills_gap: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "overall_match_percentage": skills_gap["skill_percentage"],
        "matching_skills": skills_gap["matching_skills"],
        "missing_skills": skills_gap["missing_skills"],
        "recommendations": skills_gap["recommendations"],
    }


def generate_outputs(profile: str, job_description: str) -> Dict[str, Any]:
    ensure_output_dir()
    skills_gap = build_skills_gap(profile, job_description)
    resume_text = build_resume(profile, job_description)
    ats_report_text = build_ats_report(profile, job_description, skills_gap)
    improvement_plan_text = build_improvement_plan(profile, job_description, skills_gap)
    cover_letter_text = build_cover_letter(profile, job_description)
    linkedin_about_text = build_linkedin_about(profile, job_description)
    interview_questions = build_interview_questions()
    resume_match = build_resume_match(profile, job_description, skills_gap)

    (OUTPUT_DIR / "resume.md").write_text(resume_text, encoding="utf-8")
    (OUTPUT_DIR / "ats_report.md").write_text(ats_report_text, encoding="utf-8")
    (OUTPUT_DIR / "improvement_plan.md").write_text(improvement_plan_text, encoding="utf-8")
    (OUTPUT_DIR / "cover_letter.md").write_text(cover_letter_text, encoding="utf-8")
    (OUTPUT_DIR / "linkedin_about.md").write_text(linkedin_about_text, encoding="utf-8")
    (OUTPUT_DIR / "interview_questions.md").write_text(
        "\n\n".join(
            [f"## {section.title()}\n" + "\n".join(f"- {item}" for item in questions) for section, questions in interview_questions.items()]
        ),
        encoding="utf-8",
    )

    logger.info("Generated resume, ATS report, improvement plan, and enhanced dashboard artifacts successfully.")
    return {
        "resume": resume_text,
        "ats_report": ats_report_text,
        "improvement_plan": improvement_plan_text,
        "cover_letter": cover_letter_text,
        "linkedin_about": linkedin_about_text,
        "interview_questions": interview_questions,
        "skills_gap": skills_gap,
        "resume_match": resume_match,
    }


def main() -> None:
    profile_path = INPUT_DIR / "student_profile.txt"
    job_description_path = INPUT_DIR / "job_description.txt"

    profile = read_file(profile_path) if profile_path.exists() else ""
    job_description = read_file(job_description_path) if job_description_path.exists() else ""
    generate_outputs(profile, job_description)


if __name__ == "__main__":
    main()