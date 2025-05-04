#!/usr/bin/env python3
"""
Report Generation Script

This script generates detailed HTML reports for candidate resumes.
It provides comprehensive insights and recommendations based on resume analysis.
"""

import sys
import os
import json
import argparse
import re
from model import CVEvaluationSystem

def format_experience(experience):
    """Format experience entries for the report."""
    if not experience:
        return "<p>No experience data available</p>"
    
    html = "<ul>"
    for exp in experience:
        company = exp.get('company', 'Unknown Company')
        title = exp.get('title', 'Unknown Position')
        duration = exp.get('duration', '')
        description = exp.get('description', '')
        
        html += f"<li><strong>{title} at {company}</strong> ({duration})<br>"
        if description:
            html += f"<p>{description}</p>"
        html += "</li>"
    
    html += "</ul>"
    return html

def format_education(education):
    """Format education entries for the report."""
    if not education:
        return "<p>No education data available</p>"
    
    html = "<ul>"
    for edu in education:
        degree = edu.get('degree', 'Unknown Degree')
        institution = edu.get('institution', 'Unknown Institution')
        year = edu.get('year', '')
        
        html += f"<li><strong>{degree}</strong> from {institution}"
        if year:
            html += f" ({year})"
        html += "</li>"
    
    html += "</ul>"
    return html

def format_skills(skills, matching_skills=None, missing_skills=None):
    """Format skills for the report, highlighting matching and missing skills."""
    if not skills:
        return "<p>No skills data available</p>"
    
    matching_skills = matching_skills or []
    missing_skills = missing_skills or []
    
    html = "<ul>"
    for skill in skills:
        if skill in matching_skills:
            html += f"<li><strong class='text-success'>{skill}</strong> ✓</li>"
        elif skill in missing_skills:
            html += f"<li><strong class='text-danger'>{skill}</strong> ✗</li>"
        else:
            html += f"<li>{skill}</li>"
    
    html += "</ul>"
    return html

def get_recommendation(score):
    """Generate recommendation text based on score."""
    if score >= 85:
        return "This candidate is an excellent match for the position. Recommend proceeding to the next stage of the interview process."
    elif score >= 70:
        return "This candidate is a good match for the position. Consider for further evaluation."
    elif score >= 50:
        return "This candidate meets some of the requirements. May require additional screening or skills development."
    else:
        return "This candidate is not a strong match for this specific position. Consider for other opportunities that better align with their skills."

def generate_candidate_report(resume_data, job_title="the position", evaluate=True):
    """
    Generate a detailed HTML report for a candidate.
    
    Args:
        resume_data: Dictionary containing parsed resume data
        job_title: Title of the job being applied for
        evaluate: Whether to evaluate the resume using the CV evaluation system
        
    Returns:
        HTML report content
    """
    candidate_name = "Candidate"
    
    # Try to extract candidate name from summary
    summary = resume_data.get('summary', '')
    if summary:
        name_match = re.match(r'^([A-Za-z\s]+)', summary)
        if name_match:
            candidate_name = name_match.group(1).strip()
    
    # Initialize the CV evaluation system if needed
    evaluation_data = None
    if evaluate:
        try:
            evaluator = CVEvaluationSystem()
            cv_data = {
                candidate_name: resume_data
            }
            evaluation_results = evaluator.evaluate_multiple_cvs(cv_data)
            if evaluation_results.get('individual_reports') and len(evaluation_results['individual_reports']) > 0:
                report = evaluation_results['individual_reports'][0]
                evaluation_data = {
                    'total_score': report['report']['evaluation_summary']['total_score'],
                    'decision': report['report']['evaluation_summary']['decision'],
                    'strengths': report['report']['evaluation_summary']['strengths'],
                    'weaknesses': report['report']['evaluation_summary']['weaknesses'],
                    'feedback': report['report']['full_feedback']
                }
        except Exception as e:
            print(f"Error in evaluation: {str(e)}", file=sys.stderr)
            # Continue without evaluation data
    
    # Format resume data for the report
    experience_html = format_experience(resume_data.get('experience', []))
    education_html = format_education(resume_data.get('education', []))
    skills_html = format_skills(resume_data.get('skills', []))
    
    # Generate HTML report
    html = f"""
    <div class="candidate-report">
        <h2>Candidate Evaluation Report</h2>
        
        <div class="report-section">
            <h3>Overview</h3>
            <p><strong>Candidate:</strong> {candidate_name}</p>
            <p><strong>Position:</strong> {job_title}</p>
    """
    
    # Add evaluation data if available
    if evaluation_data:
        score = evaluation_data['total_score']
        decision = evaluation_data['decision']
        
        # Add score visualization
        html += f"""
            <p><strong>Overall Match Score:</strong> {score}%</p>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: {score}%;" 
                     aria-valuenow="{score}" aria-valuemin="0" aria-valuemax="100">{score}%</div>
            </div>
            
            <p><strong>Recommendation:</strong> {decision}</p>
        """
    
    # Add experience section
    html += f"""
        </div>
        
        <div class="report-section">
            <h3>Experience</h3>
            {experience_html}
        </div>
        
        <div class="report-section">
            <h3>Education</h3>
            {education_html}
        </div>
        
        <div class="report-section">
            <h3>Skills</h3>
            {skills_html}
        </div>
    """
    
    # Add strengths and weaknesses if available
    if evaluation_data:
        strengths = evaluation_data.get('strengths', [])
        weaknesses = evaluation_data.get('weaknesses', [])
        
        if strengths:
            html += f"""
            <div class="report-section">
                <h3>Candidate Strengths</h3>
                <ul>
                    {"".join(f"<li>{strength}</li>" for strength in strengths)}
                </ul>
            </div>
            """
        
        if weaknesses:
            html += f"""
            <div class="report-section">
                <h3>Areas for Improvement</h3>
                <ul>
                    {"".join(f"<li>{weakness}</li>" for weakness in weaknesses)}
                </ul>
            </div>
            """
        
        # Add recommendation section
        html += f"""
        <div class="report-section">
            <h3>Recommendation</h3>
            <p>{get_recommendation(score)}</p>
        </div>
        """
    
    # Close the report
    html += """
    </div>
    """
    
    return html


def main():
    """Main function to run the script from command line."""
    parser = argparse.ArgumentParser(description='Generate a candidate report')
    parser.add_argument('--resume', required=True, help='Resume data JSON string or file path')
    parser.add_argument('--job-title', default='the position', help='Job title (optional)')
    parser.add_argument('--no-evaluate', action='store_true', help='Skip resume evaluation')
    args = parser.parse_args()
    
    # Parse resume data
    if os.path.isfile(args.resume):
        with open(args.resume, 'r') as f:
            resume_data = json.load(f)
    else:
        resume_data = json.loads(args.resume)
    
    # Generate report
    report = generate_candidate_report(
        resume_data,
        job_title=args.job_title,
        evaluate=not args.no_evaluate
    )
    
    # Print report
    print(report)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)