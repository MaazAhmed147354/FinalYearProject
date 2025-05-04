#!/usr/bin/env python3
"""
Resume Evaluation Script

This script uses the CV Evaluation System to score resumes against job criteria.
It integrates with the CVEvaluationSystem from the model.py class.
"""

import sys
import os
import json
import argparse
import re
from model import CVEvaluationSystem

def evaluate_resume(resume_data, criteria_data):
    """
    Evaluate a resume against job criteria using the CV Evaluation System.
    
    Args:
        resume_data: Dictionary containing parsed resume data
        criteria_data: Dictionary containing job criteria
        
    Returns:
        Dictionary with evaluation scores and feedback
    """
    # Initialize the CV evaluation system
    evaluator = CVEvaluationSystem()
    
    # Set requirements from criteria
    requirements = {
        'min_experience_years': criteria_data.get('min_experience_years', 0),
        'required_skills': criteria_data.get('required_skills', []),
        'education_level': criteria_data.get('education_level', None),
        'keywords': criteria_data.get('keywords', []),
        'industry': criteria_data.get('industry', 'general')
    }
    
    evaluator.set_requirements(requirements)
    
    # Structure resume data for evaluation
    cv_data = {
        resume_data['summary']: resume_data
    }
    
    # Evaluate the resume
    evaluation_results = evaluator.evaluate_multiple_cvs(cv_data)
    
    # Extract individual report
    if evaluation_results.get('individual_reports') and len(evaluation_results['individual_reports']) > 0:
        report = evaluation_results['individual_reports'][0]
        
        # Extract scores and feedback
        evaluation_summary = report['report']['evaluation_summary']
        score_breakdown = report['report']['score_breakdown']
        
        # Find matching and missing skills
        matching_skills = []
        missing_skills = []
        
        if requirements['required_skills']:
            resume_skills = ' '.join(resume_data.get('skills', [])).lower()
            for skill in requirements['required_skills']:
                if skill.lower() in resume_skills:
                    matching_skills.append(skill)
                else:
                    missing_skills.append(skill)
        
        # Prepare result
        result = {
            'total_score': evaluation_summary['total_score'],
            'decision': evaluation_summary['decision'],
            'skills_score': score_breakdown.get('skills_relevance', 0),
            'experience_score': score_breakdown.get('experience_quality', 0),
            'keyword_score': score_breakdown.get('keyword_matching', 0),
            'feedback': report['report']['full_feedback'],
            'matching_skills': matching_skills,
            'missing_skills': missing_skills
        }
        
        return result
    else:
        # Fallback basic evaluation if the model doesn't return expected structure
        return basic_evaluation(resume_data, criteria_data)


def basic_evaluation(resume_data, criteria_data):
    """
    Basic resume evaluation when the full model isn't available.
    
    Args:
        resume_data: Dictionary containing parsed resume data
        criteria_data: Dictionary containing job criteria
        
    Returns:
        Dictionary with basic evaluation scores
    """
    # Initialize scores
    total_score = 0
    skills_score = 0
    experience_score = 0
    keyword_score = 0
    
    # Get requirements
    min_experience = criteria_data.get('min_experience_years', 0)
    required_skills = criteria_data.get('required_skills', [])
    keywords = criteria_data.get('keywords', [])
    
    # Calculate experience score (30% weight)
    resume_experience = resume_data.get('total_experience_years', 0)
    if resume_experience >= min_experience:
        experience_ratio = min(2, resume_experience / max(1, min_experience))
        experience_score = min(100, experience_ratio * 50)
    else:
        experience_ratio = resume_experience / max(1, min_experience)
        experience_score = max(0, experience_ratio * 50)
    
    # Calculate skills score (40% weight)
    if required_skills:
        resume_skills = ' '.join(resume_data.get('skills', [])).lower()
        matching_skills = []
        missing_skills = []
        
        for skill in required_skills:
            if skill.lower() in resume_skills:
                matching_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        if required_skills:
            skills_score = (len(matching_skills) / len(required_skills)) * 100
    else:
        matching_skills = []
        missing_skills = []
        skills_score = 50  # Neutral score if no required skills specified
    
    # Calculate keyword score (30% weight)
    if keywords:
        resume_text = json.dumps(resume_data).lower()
        keyword_matches = sum(1 for kw in keywords if kw.lower() in resume_text)
        keyword_score = (keyword_matches / len(keywords)) * 100
    else:
        keyword_score = 50  # Neutral score if no keywords specified
    
    # Calculate total score
    total_score = (
        0.3 * experience_score +
        0.4 * skills_score +
        0.3 * keyword_score
    )
    
    # Determine decision
    if total_score >= 85:
        decision = "Highly Recommended"
    elif total_score >= 70:
        decision = "Recommended"
    elif total_score >= 50:
        decision = "Maybe Consider"
    else:
        decision = "Not Recommended"
    
    # Generate feedback
    feedback = []
    
    if experience_score < 50:
        feedback.append("Experience level is below the required minimum")
    elif experience_score >= 80:
        feedback.append("Strong experience that meets or exceeds requirements")
    
    if skills_score < 50:
        feedback.append("Missing several required skills")
    elif skills_score >= 80:
        feedback.append("Excellent skill match with requirements")
    
    if missing_skills:
        feedback.append(f"Missing skills: {', '.join(missing_skills[:3])}")
    
    if matching_skills:
        feedback.append(f"Matching skills: {', '.join(matching_skills[:3])}")
    
    # Return result
    return {
        'total_score': round(total_score, 1),
        'decision': decision,
        'skills_score': round(skills_score, 1),
        'experience_score': round(experience_score, 1),
        'keyword_score': round(keyword_score, 1),
        'feedback': feedback,
        'matching_skills': matching_skills,
        'missing_skills': missing_skills
    }


def main():
    """Main function to run the script from command line."""
    parser = argparse.ArgumentParser(description='Evaluate a resume against job criteria')
    parser.add_argument('--resume', required=True, help='Resume data JSON string or file path')
    parser.add_argument('--criteria', required=True, help='Job criteria JSON string or file path')
    args = parser.parse_args()
    
    # Parse resume data
    if os.path.isfile(args.resume):
        with open(args.resume, 'r') as f:
            resume_data = json.load(f)
    else:
        resume_data = json.loads(args.resume)
    
    # Parse criteria data
    if os.path.isfile(args.criteria):
        with open(args.criteria, 'r') as f:
            criteria_data = json.load(f)
    else:
        criteria_data = json.loads(args.criteria)
    
    # Evaluate resume
    evaluation = evaluate_resume(resume_data, criteria_data)
    
    # Print result
    print(json.dumps(evaluation, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)