import json
import os
import tempfile
from model import CVEvaluationSystem
import pdfplumber
import re

def parse_resume(event, context):
    """
    Parses a resume file
    Expected input:
      - file_path: Path to the PDF file
    """
    try:
        # Parse request body
        body = json.loads(event['body'])
        file_path = body.get('file_path')
       
        if not file_path:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing file_path'})
            }
       
        # Check if file exists
        if not os.path.exists(file_path):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'File not found: {file_path}'})
            }
       
        try:
            # Parse PDF
            cv_data = parse_pdf_to_cv_data(file_path)
           
            # Important! Make sure cv_data is JSON serializable
            # Convert any non-serializable types
            cv_data = ensure_json_serializable(cv_data)
           
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(cv_data)
            }
        except Exception as e:
            print(f"Error parsing PDF: {str(e)}")
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f'Error parsing PDF: {str(e)}'})
            }
           
    except Exception as e:
        print(f"Error in parse_resume: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def ensure_json_serializable(data):
    """Ensure all values in a dictionary are JSON serializable"""
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                result[key] = ensure_json_serializable(value)
            elif isinstance(value, (str, int, float, bool)) or value is None:
                result[key] = value
            else:
                # Convert non-serializable types to strings
                result[key] = str(value)
        return result
    elif isinstance(data, list):
        return [ensure_json_serializable(item) for item in data]
    elif isinstance(data, (str, int, float, bool)) or data is None:
        return data
    else:
        return str(data)

def evaluate_resume(event, context):
    """
    Evaluates a resume against job requirements
    Expected input:
      - resume_data: Parsed resume data
      - requirements: Job requirements
    """
    try:
        print("Evaluate resume endpoint called")
       
        # Parse request body
        body = json.loads(event['body'])
        resume_data = body.get('resume_data')
        requirements = body.get('requirements')
       
        print(f"Resume data received: {json.dumps(resume_data)[:100]}...")
        print(f"Requirements received: {json.dumps(requirements)[:100]}...")
       
        if not resume_data or not requirements:
            print("Missing required data")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing resume_data or requirements',
                    'individual_reports': [],
                    'summary_report': {}
                })
            }
       
        # Initialize evaluation system
        try:
            eval_system = CVEvaluationSystem()
            eval_system.set_requirements(requirements)
           
            # Create a dictionary with a single entry for the resume
            data_for_evaluation = {'resume_1': resume_data}
           
            # Evaluate
            results = eval_system.evaluate_multiple_cvs(data_for_evaluation)
            print("Evaluation completed successfully")
           
            # Ensure results are JSON serializable
            results = ensure_json_serializable(results)
           
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(results)
            }
        except Exception as e:
            print(f"Error during evaluation: {str(e)}")
            # Return a structured error response (still valid JSON)
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Evaluation error: {str(e)}',
                    'individual_reports': [],
                    'summary_report': {}
                })
            }
           
    except Exception as e:
        print(f"Error in evaluate_resume: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'individual_reports': [],
                'summary_report': {}
            })
        }

def parse_pdf_to_cv_data(pdf_path):
    """Parse a PDF CV into the format expected by our model"""
    try:
        # Check file size first to avoid processing extremely large files
        file_size = os.path.getsize(pdf_path)
        print(f"Processing file of size {file_size} bytes")
        
        if file_size > 10_000_000:  # 10MB
            print(f"File too large: {file_size} bytes")
            return {
                'summary': 'File too large for processing. Please submit a smaller PDF.',
                'experience': [],
                'education': [],
                'skills': [],
                'accomplishments': [],
                'total_experience_years': 0
            }
        
        # OPTIMIZATION: More aggressive approach for large files
        with pdfplumber.open(pdf_path) as pdf:
            # Adjust max pages based on file size
            max_pages = 1 if file_size > 5_000_000 else min(3, len(pdf.pages))
            print(f"Processing {max_pages} pages from PDF")
            
            # Process with page timeout
            extracted_text = []
            for i in range(max_pages):
                try:
                    page_text = pdf.pages[i].extract_text()
                    if page_text:
                        extracted_text.append(page_text)
                except Exception as e:
                    print(f"Error extracting page {i}: {str(e)}")
                    continue
            
            text = "\n".join(extracted_text)
        
        print(f"Extracted text length: {len(text)}")
        
        # If text is empty, return basic structure
        if not text.strip():
            print("Warning: Extracted empty text from PDF")
            return {
                'summary': 'No text could be extracted from this PDF.',
                'experience': [],
                'education': [],
                'skills': [],
                'accomplishments': [],
                'total_experience_years': 0
            }
        
        # Simple, faster parsing logic
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
        
        # Extract skills (simpler regex)
        skills_match = re.search(r'(?i)skills[:\s]*(.*?)(?:\n\n|\Z)', text, re.DOTALL)
        if skills_match:
            skills_text = skills_match.group(1)
            # Simple split by common delimiters
            sections['skills'] = [s.strip() for s in re.split(r'[,•\n]', skills_text) if s.strip()]
        
        # Simple experience extraction (limit to 3)
        exp_matches = re.findall(r'(?i)((?:20|19)\d{2}\s*[-—–]\s*(?:20|19)\d{2}|(?:20|19)\d{2}\s*[-—–]\s*present)(.+?)(?=(?:20|19)\d{2}|\Z)', text, re.DOTALL)
        for i, (duration, desc) in enumerate(exp_matches[:3]):
            sections['experience'].append({
                'duration': duration.strip(),
                'description': desc.strip()
            })
        
        # Extract education
        edu_section = re.search(r'(?i)education[:\s]*(.*?)(?:\n\n|\Z)', text, re.DOTALL)
        if edu_section:
            edu_text = edu_section.group(1)
            # Simple extraction
            degrees = re.findall(r'((?:B\.?S\.?|M\.?S\.?|Ph\.?D\.?|Bachelor|Master|Doctorate|Associate).*?)(?:\n\n|\Z)', edu_text, re.DOTALL)
            for degree in degrees[:2]:  # Limit to 2
                sections['education'].append({
                    'degree': degree.strip(),
                    'institution': degree.strip()  # Simplified
                })
        
        return sections
    except Exception as e:
        print(f"Error in parse_pdf_to_cv_data: {str(e)}")
        return {
            'summary': f'Error parsing PDF: {str(e)}',
            'experience': [],
            'education': [],
            'skills': [],
            'accomplishments': [],
            'total_experience_years': 0
        }