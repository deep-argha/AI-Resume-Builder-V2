from crewai import Task

resume_task = Task(
    description="""
    Using the student's profile:

    {profile}

    Create a professional ATS friendly resume.

    Use markdown formatting.

    Save only resume content.
    """,

    expected_output="Complete ATS Resume",

    output_file="output/resume.md"
)


job_analysis_task = Task(
    description="""
    Analyze the following Job Description.

    {job_description}

    Extract

    - Required Skills
    - Preferred Skills
    - Responsibilities
    - Experience
    - Keywords
    """,

    expected_output="Job Analysis"
)

skill_gap_task = Task(
    description="""
    Compare

    Student Profile

    {profile}

    with

    Job Description

    {job_description}

    Produce

    - ATS Score (/100)
    - Missing Skills
    - Matching Skills
    - Improvement Plan

    Save ATS report separately.
    """,

    expected_output="Skill Gap Analysis",

    output_file="output/ats_report.md"
)

improvement_task = Task(
    description="""
    Based on the gap analysis,
    create a roadmap for improving
    the resume and candidate profile.

    Save in markdown.
    """,

    expected_output="Improvement Plan",

    output_file="output/improvement_plan.md"
)