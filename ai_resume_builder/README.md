# AI Resume Builder

AI Resume Builder is an intelligent resume generation system that helps users create an ATS-friendly resume tailored to a specific job description. The application uses multiple AI agents to analyze a candidate profile, evaluate alignment with a target role, and generate actionable improvement suggestions.

## 1. Project Overview

This project combines the power of CrewAI, Ollama, and Markdown to automate the resume creation workflow. It reads a student profile and a job description, then produces:

- a polished resume in Markdown format
- an ATS analysis report
- an improvement plan to help the candidate better match the role

The system is designed to be simple to use while still providing professional-quality outputs for job applications.

## 2. Features

- Reads and analyzes input from:
  - input/student_profile.txt
  - input/job_description.txt
- Generates a tailored resume optimized for applicant tracking systems (ATS)
- Provides an ATS review report with matching and missing skills
- Suggests a practical improvement plan for career growth
- Uses multiple specialized AI agents for writing, analysis, and coaching

## 3. Project Structure

```text
ai_resume_builder/
├── agents.py
├── crew.py
├── main.py
├── tasks.py
├── requirements.txt
├── input/
│   ├── student_profile.txt
│   └── job_description.txt
├── output/
│   ├── resume.md
│   ├── ats_report.md
│   └── improvement_plan.md
└── README.md
```

## 4. Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai_resume_builder
```

2. Create and activate a virtual environment:

On Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Install and run Ollama locally.

Make sure the Llama 3.2 model is available:

```bash
ollama pull llama3.2
```

5. Start the Ollama service if required:

```bash
ollama serve
```

## 5. How to Run

1. Update the input files with your own content:
   - input/student_profile.txt
   - input/job_description.txt

2. Run the application:

```bash
python main.py
```

3. The generated output files will be written to the output folder.

## 6. Output Files

The application produces the following files:

- output/resume.md — a professional resume tailored to the job description
- output/ats_report.md — an ATS-focused analysis of how well the resume matches the role
- output/improvement_plan.md — a structured plan for improving the resume and skill profile

## 7. Technologies Used

- Python
- CrewAI
- Ollama (Llama 3.2)
- Markdown

## 8. Future Improvements

Potential enhancements for future versions include:

- support for multiple resume templates
- export to PDF or DOCX
- integration with LinkedIn or other profile sources
- improved personalization and style customization
- support for additional language models and providers

## 9. Author

Developed by: [Your Name]

---

If you would like, I can also help you add a screenshot section, badges, or a more detailed usage guide to this README.
