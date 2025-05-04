#!/usr/bin/env python3
"""
Resume Parser Script

This script uses the Python model to parse resumes from PDF, DOCX, and other formats.
It extracts text, identifies sections, and structures the data for the ResuMatch system.
"""

import sys
import os
import json
import re
import argparse
from datetime import datetime
import pdfplumber
try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


def parse_pdf_to_text(file_path):
    """Extract text from PDF file."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n\n"
        return text
    except Exception as e:
        print(f"Error parsing PDF: {str(e)}", file=sys.stderr)
        return None


def parse_docx_to_text(file_path):
    """Extract text from DOCX file."""
    if not HAS_DOCX:
        print("python-docx library not installed, cannot parse DOCX files", file=sys.stderr)
        return None
    
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        print(f"Error parsing DOCX: {str(e)}", file=sys.stderr)
        return None


def extract_text_from_file(file_path):
    """Extract text from various file formats."""
    _, file_ext = os.path.splitext(file_path)
    file_ext = file_ext.lower()
    
    if file_ext == '.pdf':
        return parse_pdf_to_text(file_path)
    elif file_ext in ['.docx', '.doc']:
        return parse_docx_to_text(file_path)
    elif file_ext in ['.txt', '.rtf']:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading text file: {str(e)}", file=sys.stderr)
            return None
    else:
        print(f"Unsupported file format: {file_ext}", file=sys.stderr)
        return None


def extract_sections(text):
    """
    Extract different sections from resume text.
    
    Tries to identify standard sections like:
    - Summary/Profile
    - Experience/Work Experience
    - Education
    - Skills
    - Projects
    - Certifications
    """
    if not text:
        return {}
    
    sections = {}
    
    # Try to extract candidate name from first lines
    lines = text.split('\n')
    sections['summary'] = lines[0] if lines else "Unknown"
    
    # Extract sections using regex patterns
    section_patterns = {
        'summary': r'(?i)(?:summary|profile|objective|about).*?\n(.*?)(?=\n\s*(?:experience|education|skills|projects|certifications|references|\Z))',
        'experience': r'(?i)(?:experience|work experience|employment|work history).*?\n(.*?)(?=\n\s*(?:education|skills|projects|certifications|references|\Z))',
        'education': r'(?i)(?:education|academic|qualifications).*?\n(.*?)(?=\n\s*(?:experience|skills|projects|certifications|references|\Z))',
        'skills': r'(?i)(?:skills|technologies|competencies|technical skills).*?\n(.*?)(?=\n\s*(?:experience|education|projects|certifications|references|\Z))',
        'projects': r'(?i)(?:projects|portfolio).*?\n(.*?)(?=\n\s*(?:experience|education|skills|certifications|references|\Z))',
        'certifications': r'(?i)(?:certifications|certificates|professional development).*?\n(.*?)(?=\n\s*(?:experience|education|skills|projects|references|\Z))'
    }
    
    for section_name, pattern in section_patterns.items():
        match = re.search(pattern, text, re.DOTALL)
        if match:
            sections[section_name] = match.group(1).strip()
    
    return sections


def parse_experience(experience_text):
    """Parse experience section into structured format."""
    if not experience_text:
        return []
    
    experiences = []
    
    # Try to identify individual job entries
    # Look for patterns with job title, company, and dates
    job_pattern = r'(?i)(.*?)\s+(?:at|@|,|\-)\s+(.*?)\s+(?:from\s+)?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(?:\-|to)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(?:\-|to)\s*(?:Present|Current|Now)|(?:\d{1,2}/\d{4})\s*(?:\-|to)\s*(?:\d{1,2}/\d{4}|Present|Current|Now))'
    
    job_matches = re.finditer(job_pattern, experience_text)
    
    for match in job_matches:
        title = match.group(1).strip()
        company = match.group(2).strip()
        duration = match.group(3).strip()
        
        # Extract next paragraph as description
        description_pattern = rf'{re.escape(match.group(0))}(.*?)(?=(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{{4}}|\Z)'
        description_match = re.search(description_pattern, experience_text, re.DOTALL)
        description = description_match.group(1).strip() if description_match else ""
        
        experiences.append({
            'title': title,
            'company': company,
            'duration': duration,
            'description': description
        })
    
    # If no matches found, try alternate parsing strategy
    if not experiences:
        # Split by dates
        date_pattern = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(?:\-|to)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(?:\-|to)\s*(?:Present|Current|Now)|(?:\d{1,2}/\d{4})\s*(?:\-|to)\s*(?:\d{1,2}/\d{4}|Present|Current|Now)'
        date_matches = list(re.finditer(date_pattern, experience_text))
        
        for i, match in enumerate(date_matches):
            duration = match.group(0)
            start_pos = match.end()
            end_pos = date_matches[i+1].start() if i+1 < len(date_matches) else len(experience_text)
            
            job_text = experience_text[start_pos:end_pos].strip()
            lines = job_text.split('\n', 1)
            
            title_company = lines[0] if lines else ""
            description = lines[1] if len(lines) > 1 else ""
            
            # Try to separate title and company
            title_parts = title_company.split(' at ', 1)
            if len(title_parts) == 2:
                title, company = title_parts
            else:
                title_parts = title_company.split('@', 1)
                if len(title_parts) == 2:
                    title, company = title_parts
                else:
                    title, company = title_company, ""
            
            experiences.append({
                'title': title.strip(),
                'company': company.strip(),
                'duration': duration,
                'description': description.strip()
            })
    
    return experiences


def parse_education(education_text):
    """Parse education section into structured format."""
    if not education_text:
        return []
    
    education_entries = []
    
    # Look for degree and institution patterns
    degree_pattern = r'(?i)(Bachelor|Master|MBA|PhD|BSc|MSc|BA|MA|Associate|Diploma|Certificate)(?:[^,]*?(?:of|in|)(?: |\n)([^,]*?))\s+(?:from|at|,)\s+(.*?)(?:(\d{4})|$)'
    
    degree_matches = re.finditer(degree_pattern, education_text)
    
    for match in degree_matches:
        degree_type = match.group(1).strip()
        field = match.group(2).strip() if match.group(2) else ""
        institution = match.group(3).strip()
        year = match.group(4) if match.group(4) else ""
        
        degree = f"{degree_type} {field}".strip()
        
        education_entries.append({
            'degree': degree,
            'institution': institution,
            'year': year,
            'description': match.group(0)
        })
    
    # If no matches found, try alternate parsing strategy
    if not education_entries:
        # Try to find university/college names
        institution_pattern = r'(?i)(University|College|Institute|School) of ([A-Za-z\s]+)'
        institution_matches = re.finditer(institution_pattern, education_text)
        
        for match in institution_matches:
            institution = f"{match.group(1)} of {match.group(2)}".strip()
            
            # Look for nearby degree info
            context = education_text[max(0, match.start() - 100):min(match.end() + 100, len(education_text))]
            degree_match = re.search(r'(?i)(Bachelor|Master|MBA|PhD|BSc|MSc|BA|MA|Associate|Diploma)', context)
            
            degree = degree_match.group(1) if degree_match else "Degree"
            
            education_entries.append({
                'degree': degree,
                'institution': institution,
                'year': "",
                'description': context.strip()
            })
    
    return education_entries


def parse_skills(skills_text):
    """Parse skills section into list of skills."""
    if not skills_text:
        return []
    
    # First, clean up the text
    # Remove common headers or prefixes
    skills_text = re.sub(r'(?i)^(skills|technical skills|technologies|competencies):\s*', '', skills_text)
    
    # Try different parsing strategies
    
    # Strategy 1: Split by commas
    if ',' in skills_text:
        skills = [skill.strip() for skill in skills_text.split(',')]
        # Filter out empty entries and entries that are too long (likely not skills)
        skills = [skill for skill in skills if skill and len(skill) < 50]
        if skills:
            return skills
    
    # Strategy 2: Split by bullet points
    if '•' in skills_text:
        skills = [skill.strip() for skill in skills_text.split('•')]
        skills = [skill for skill in skills if skill and len(skill) < 50]
        if skills:
            return skills
    
    # Strategy 3: Look for newlines or multiple spaces as separators
    skills = re.split(r'\n+|\s{2,}', skills_text)
    skills = [skill.strip() for skill in skills]
    skills = [skill for skill in skills if skill and len(skill) < 50]
    
    return skills


def parse_resume(file_path):
    """
    Main function to parse a resume from file.
    
    Args:
        file_path: Path to the resume file
        
    Returns:
        A dictionary with structured resume data
    """
    # Extract text from file
    text = extract_text_from_file(file_path)
    if not text:
        return {"error": "Failed to extract text from file"}
    
    # Extract sections
    sections = extract_sections(text)
    
    # Parse experience
    experience_data = parse_experience(sections.get('experience', ''))
    
    # Parse education
    education_data = parse_education(sections.get('education', ''))
    
    # Parse skills
    skills_data = parse_skills(sections.get('skills', ''))
    
    # Calculate total experience in years
    total_experience_years = 0
    for exp in experience_data:
        duration = exp.get('duration', '')
        years_match = re.search(r'(\d+)\s*(?:years|year)', duration, re.IGNORECASE)
        if years_match:
            total_experience_years += int(years_match.group(1))
        elif 'present' in duration.lower() or 'current' in duration.lower():
            # Estimate current position duration
            year_pattern = r'(\d{4})'
            years = re.findall(year_pattern, duration)
            if years:
                start_year = int(years[0])
                current_year = datetime.now().year
                total_experience_years += (current_year - start_year)
    
    # Build structured resume data
    resume_data = {
        'summary': sections.get('summary', ''),
        'experience': experience_data,
        'education': education_data,
        'skills': skills_data,
        'total_experience_years': total_experience_years,
        'certifications': sections.get('certifications', ''),
        'projects': sections.get('projects', '')
    }
    
    return resume_data


def main():
    """Main function to run the script from command line."""
    parser = argparse.ArgumentParser(description='Parse a resume file')
    parser.add_argument('file_path', help='Path to the resume file')
    args = parser.parse_args()
    
    resume_data = parse_resume(args.file_path)
    print(json.dumps(resume_data, indent=2))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main()
    else:
        print("Error: Please provide a file path", file=sys.stderr)
        sys.exit(1)