import json
import base64
import tempfile
import os
import re
from model import CVEvaluationSystem
import pdfplumber

def evaluate_resume(event, context):
    """
    Evaluates a resume against job requirements
    Expected input:
        - resume_data: Parsed resume data JSON
        - requirements: Job requirements JSON
    """
    try:
        # Parse the request body
        body = json.loads(event['body'])
        resume_data = body.get('resume_data')
        requirements = body.get('requirements')
        
        if not resume_data or not requirements:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing resume_data or requirements'})
            }
        
        # Initialize evaluation system
        eval_system = CVEvaluationSystem()
        eval_system.set_requirements(requirements)
        
        # Evaluate the resume (wrap in a dictionary with a key for the CV ID)
        results = eval_system.evaluate_multiple_cvs({'single_resume': resume_data})
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(results)
        }
    except Exception as e:
        print(f"Error in evaluate_resume: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def parse_resume(event, context):
    """
    Parses a PDF resume file
    Expected input:
        - file: Base64 encoded PDF file
    """
    try:
        # Parse the request body
        body = json.loads(event['body'])
        file_data = body.get('file')
        
        if not file_data:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing file data'})
            }
        
        # Decode base64 file
        try:
            # Handle base64 with or without data URI prefix
            if ',' in file_data:
                file_data = file_data.split(',')[1]
            file_content = base64.b64decode(file_data)
        except Exception as e:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Invalid file encoding: {str(e)}'})
            }
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_path = temp_file.name
            temp_file.write(file_content)
        
        try:
            # Parse PDF
            cv_data = parse_pdf_to_cv_data(temp_path)
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(cv_data)
            }
        except Exception as e:
            # Clean up on error
            os.unlink(temp_path)
            raise e
            
    except Exception as e:
        print(f"Error in parse_resume: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def parse_pdf_to_cv_data(pdf_path):
    """Parse a PDF CV into the format expected by our model"""
    with pdfplumber.open(pdf_path) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages])
    
    sections = {
        'summary': '',
        'experience': [],
        'education': [],
        'skills': [],
        'accomplishments': []
    }
    
    # Extract summary (first paragraph)
    paragraphs = text.split('\n\n')
    if paragraphs:
        sections['summary'] = paragraphs[0].strip()
    
    # Simple experience extraction
    exp_pattern = r'(?P<title>.+?)\s*(?:at|@|in|,)\s*(?P<company>.+?)\s*(?P<duration>\d{1,2}/\d{4}\s*to\s*\d{1,2}/\d{4}|present)'
    for match in re.finditer(exp_pattern, text, re.IGNORECASE):
        sections['experience'].append({
            'title': match.group('title').strip(),
            'company': match.group('company').strip(),
            'duration': match.group('duration').strip(),
            'description': match.group(0)
        })
    
    # Simple education extraction
    edu_pattern = r'(?P<degree>.+?)\s*(?:at|from|,)\s*(?P<institution>.+?)(?:\s*\d{4})?'
    for match in re.finditer(edu_pattern, text, re.IGNORECASE):
        sections['education'].append({
            'degree': match.group('degree').strip(),
            'institution': match.group('institution').strip(),
            'description': match.group(0)
        })
    
    # Skills extraction
    skills_section = re.search(r'Skills:\s*(.*?)(?:\n\n|\n\w+:)', text, re.IGNORECASE|re.DOTALL)
    if skills_section:
        sections['skills'] = [s.strip() for s in re.split(r'[,•\n]', skills_section.group(1)) if s.strip()]
    
    # Accomplishments extraction
    acc_section = re.search(r'(?:Achievements|Accomplishments):\s*(.*?)(?:\n\n|\n\w+:)', text, re.IGNORECASE|re.DOTALL)
    if acc_section:
        sections['accomplishments'] = [a.strip() for a in re.split(r'[\n•]', acc_section.group(1)) if a.strip()]
    
    # Calculate total experience years
    total_exp_years = 0
    for exp in sections['experience']:
        duration = exp.get('duration', '')
        # Simple heuristic - if it contains "years" or "months"
        years_match = re.search(r'(\d+)\s*year', duration, re.IGNORECASE)
        if years_match:
            total_exp_years += int(years_match.group(1))
        
    # Add the total experience years to the result
    sections['total_experience_years'] = total_exp_years
    
    return sections