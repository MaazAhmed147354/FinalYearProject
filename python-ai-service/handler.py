import json
import os
import tempfile
from model import CVEvaluationSystem
import pdfplumber
import re
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing file_path'})
            }
        
        # Check if file exists
        if not os.path.exists(file_path):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'File not found: {file_path}'})
            }
        
        try:
            # Parse PDF
            cv_data = parse_pdf_to_cv_data(file_path)
            
            # Important! Make sure cv_data is JSON serializable
            # Convert any non-serializable types
            cv_data = ensure_json_serializable(cv_data)
            
            # Test JSON serialization to catch issues early
            try:
                json_str = json.dumps(cv_data)
                json.loads(json_str)  # Verify it can be parsed back
                logger.info(f"Successfully serialized CV data, length: {len(json_str)}")
            except Exception as json_err:
                logger.error(f"JSON serialization test failed: {str(json_err)}")
                # Fall back to simpler structure
                cv_data = {
                    'summary': cv_data.get('summary', ''),
                    'experience': [],
                    'education': [],
                    'skills': cv_data.get('skills', []),
                    'accomplishments': [],
                    'total_experience_years': 0
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(cv_data)
            }
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Error parsing PDF: {str(e)}',
                    'summary': 'Failed to parse resume automatically.',
                    'experience': [],
                    'education': [],
                    'skills': [],
                    'accomplishments': [],
                    'total_experience_years': 0
                })
            }
            
    except Exception as e:
        logger.error(f"Error in parse_resume: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'summary': 'Internal server error during resume parsing.',
                'experience': [],
                'education': [],
                'skills': [],
                'accomplishments': [],
                'total_experience_years': 0
            })
        }

def ensure_json_serializable(data):
    """Ensure all values in a dictionary are JSON serializable"""
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                result[key] = ensure_json_serializable(value)
            elif isinstance(value, (str, int, float, bool)) or value is None:
                # Extra sanitization for strings
                if isinstance(value, str):
                    # Remove any control characters that might break JSON
                    value = ''.join(c for c in value if ord(c) >= 32 or c == '\n' or c == '\t')
                result[key] = value
            else:
                # Convert non-serializable types to strings and sanitize
                result[key] = ''.join(c for c in str(value) if ord(c) >= 32 or c == '\n' or c == '\t')
        return result
    elif isinstance(data, list):
        return [ensure_json_serializable(item) for item in data]
    elif isinstance(data, (str, int, float, bool)) or data is None:
        # Extra sanitization for strings
        if isinstance(data, str):
            # Remove any control characters that might break JSON
            data = ''.join(c for c in data if ord(c) >= 32 or c == '\n' or c == '\t')
        return data
    else:
        # Convert to sanitized string
        return ''.join(c for c in str(data) if ord(c) >= 32 or c == '\n' or c == '\t')

def evaluate_resume(event, context):
    """
    Evaluates a resume against job requirements
    Expected input:
      - resume_data: Parsed resume data
      - requirements: Job requirements
    """
    try:
        logger.info("Evaluate resume endpoint called")
        
        # Parse request body
        body = json.loads(event['body'])
        resume_data = body.get('resume_data')
        requirements = body.get('requirements')
        
        logger.info(f"Resume data received: {json.dumps(resume_data)[:100]}...")
        logger.info(f"Requirements received: {json.dumps(requirements)[:100]}...")
        
        if not resume_data or not requirements:
            logger.warning("Missing required data")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing resume_data or requirements',
                    'individual_reports': [{
                        'cv_id': 'resume_1',
                        'industry': 'unknown',
                        'report': {
                            'evaluation_summary': {
                                'total_score': 0,
                                'decision': 'Error',
                                'strengths': [],
                                'weaknesses': ['Missing required data']
                            },
                            'score_breakdown': {},
                            'full_feedback': ['Missing resume_data or requirements']
                        },
                        'meets_requirements': {'error': True}
                    }],
                    'summary_report': {
                        'total_cvs_evaluated': 1,
                        'average_score': 0,
                        'meets_requirements_count': 0,
                        'meets_requirements_percentage': 0,
                        'industry_distribution': {'unknown': 1},
                        'decision_distribution': {'Error': 1},
                        'common_strengths': [],
                        'common_weaknesses': [['Missing required data', 1]]
                    }
                })
            }
        
        # Initialize evaluation system
        try:
            # Ensure both inputs are serializable
            resume_data = ensure_json_serializable(resume_data)
            requirements = ensure_json_serializable(requirements)
            
            # Validate and fix resume_data before evaluation
            if 'experience' not in resume_data or not resume_data['experience']:
                resume_data['experience'] = [{'duration': 'Not specified', 'description': 'Experience information could not be extracted from the resume'}]
            
            if 'education' not in resume_data or not resume_data['education']:
                resume_data['education'] = [{'degree': 'Not specified', 'institution': 'Not specified'}]
            
            if 'skills' not in resume_data or not resume_data['skills']:
                resume_data['skills'] = ['Skills information could not be extracted from the resume']
            
            if 'summary' not in resume_data or not resume_data['summary']:
                resume_data['summary'] = 'Summary information could not be extracted from the resume'
            
            eval_system = CVEvaluationSystem()
            eval_system.set_requirements(requirements)
            
            # Create a dictionary with a single entry for the resume
            data_for_evaluation = {'resume_1': resume_data}
            
            # Evaluate
            results = eval_system.evaluate_multiple_cvs(data_for_evaluation)
            logger.info("Evaluation completed successfully")
            
            # Ensure results are JSON serializable
            results = ensure_json_serializable(results)
            
            # Test JSON serialization to catch issues early
            try:
                json_str = json.dumps(results)
                json.loads(json_str)  # Verify it can be parsed back
                logger.info(f"Successfully serialized results, length: {len(json_str)}")
            except Exception as json_err:
                logger.error(f"JSON serialization test failed: {str(json_err)}")
                # Fall back to simpler structure with correct format
                results = {
                    'individual_reports': [{
                        'cv_id': 'resume_1',
                        'industry': 'general',
                        'report': {
                            'evaluation_summary': {
                                'total_score': 50,
                                'decision': 'Maybe Consider',
                                'strengths': [],
                                'weaknesses': ['Error in JSON serialization']
                            },
                            'score_breakdown': {},
                            'full_feedback': ['Error processing results, basic evaluation provided']
                        },
                        'meets_requirements': {'overall': False}
                    }],
                    'summary_report': {
                        'total_cvs_evaluated': 1,
                        'average_score': 50,
                        'meets_requirements_count': 0,
                        'meets_requirements_percentage': 0,
                        'industry_distribution': {'general': 1},
                        'decision_distribution': {'Maybe Consider': 1},
                        'common_strengths': [],
                        'common_weaknesses': [['Error in JSON serialization', 1]]
                    }
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(results)
            }
        except Exception as e:
            logger.error(f"Error during evaluation: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Return a properly structured error response
            error_response = {
                'individual_reports': [{
                    'cv_id': 'resume_1',
                    'industry': 'unknown',
                    'report': {
                        'evaluation_summary': {
                            'total_score': 0,
                            'decision': 'Error',
                            'strengths': [],
                            'weaknesses': [f'Error during evaluation: {str(e)}']
                        },
                        'score_breakdown': {},
                        'full_feedback': [f'Error during evaluation: {str(e)}'],
                        'extracted_data': resume_data
                    },
                    'meets_requirements': {'error': True}
                }],
                'summary_report': {
                    'total_cvs_evaluated': 1,
                    'average_score': 0,
                    'meets_requirements_count': 0,
                    'meets_requirements_percentage': 0,
                    'industry_distribution': {'unknown': 1},
                    'decision_distribution': {'Error': 1},
                    'common_strengths': [],
                    'common_weaknesses': [[f'Error during evaluation: {str(e)}', 1]]
                }
            }
            
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(error_response)
            }
        
    except Exception as e:
        logger.error(f"Error in evaluate_resume: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Create a properly structured error response
        error_response = {
            'individual_reports': [{
                'cv_id': 'resume_1',
                'industry': 'unknown',
                'report': {
                    'evaluation_summary': {
                        'total_score': 0,
                        'decision': 'Error',
                        'strengths': [],
                        'weaknesses': [f'System error: {str(e)}']
                    },
                    'score_breakdown': {},
                    'full_feedback': [f'System error: {str(e)}']
                },
                'meets_requirements': {'error': True}
            }],
            'summary_report': {
                'total_cvs_evaluated': 1,
                'average_score': 0,
                'meets_requirements_count': 0,
                'meets_requirements_percentage': 0,
                'industry_distribution': {'unknown': 1},
                'decision_distribution': {'Error': 1},
                'common_strengths': [],
                'common_weaknesses': [[f'System error: {str(e)}', 1]]
            }
        }
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_response)
        }

def parse_pdf_to_cv_data(pdf_path):
    """Parse a PDF CV into the format expected by our model"""
    try:
        # Check file size first to avoid processing extremely large files
        file_size = os.path.getsize(pdf_path)
        logger.info(f"Processing file of size {file_size} bytes")
        
        if file_size > 10_000_000:  # 10MB
            logger.warning(f"File too large: {file_size} bytes")
            return {
                'summary': 'File too large for processing. Please submit a smaller PDF.',
                'experience': [{'duration': 'Not specified', 'description': 'File was too large to process'}],
                'education': [{'degree': 'Not specified', 'institution': 'Not specified'}],
                'skills': ['Not extracted due to file size'],
                'total_experience_years': 0
            }
        
        # Open PDF with more robust error handling
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Adjust max pages based on file size
                max_pages = 1 if file_size > 5_000_000 else min(3, len(pdf.pages))
                logger.info(f"Processing {max_pages} pages from PDF")
                
                # Process with page timeout
                extracted_text = []
                for i in range(max_pages):
                    try:
                        page_text = pdf.pages[i].extract_text()
                        if page_text:
                            extracted_text.append(page_text)
                    except Exception as e:
                        logger.error(f"Error extracting page {i}: {str(e)}")
                        continue
                
                text = "\n".join(extracted_text)
        except Exception as pdf_err:
            logger.error(f"Error opening PDF: {str(pdf_err)}")
            return {
                'summary': f'Error opening PDF: {str(pdf_err)}',
                'experience': [{'duration': 'Not specified', 'description': 'Could not read PDF file'}],
                'education': [{'degree': 'Not specified', 'institution': 'Not specified'}],
                'skills': ['Not extracted due to file read error'],
                'total_experience_years': 0
            }
        
        logger.info(f"Extracted text length: {len(text)}")
        
        # If text is empty, return basic structure
        if not text.strip():
            logger.warning("Warning: Extracted empty text from PDF")
            return {
                'summary': 'No text could be extracted from this PDF.',
                'experience': [{'duration': 'Not specified', 'description': 'No text extracted from PDF'}],
                'education': [{'degree': 'Not specified', 'institution': 'Not specified'}],
                'skills': ['Not extracted - no text in PDF'],
                'total_experience_years': 0
            }
        
        # Simple, faster parsing logic with more robust default values
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
        
        # Extract skills (simpler regex) with better fallback
        skills_match = re.search(r'(?i)skills[\s:]*(.+?)(?:\n\n|\Z)', text, re.DOTALL)
        if skills_match:
            skills_text = skills_match.group(1)
            # Simple split by common delimiters and filter empty entries
            skills_list = [s.strip() for s in re.split(r'[,•\n]', skills_text) if s.strip()]
            # Sanitize each skill
            skills_list = [re.sub(r'[^\w\s\-.,:()/\'\"]', '', skill) for skill in skills_list]
            sections['skills'] = skills_list
        
        # Ensure skills is populated
        if not sections['skills']:
            # Try to extract any keywords that might be skills
            potential_skills = re.findall(r'(?:Java|Python|C\+\+|JavaScript|HTML|CSS|SQL|Excel|Word|PowerPoint|Management|Leadership|Communication|Analysis|Design|Development|Testing)', text)
            sections['skills'] = list(set(potential_skills)) if potential_skills else ['No skills explicitly found in resume']
        
        # Simple experience extraction (limit to 3) with robust error handling
        exp_matches = re.findall(r'(?i)((?:20|19)\d{2}\s*[------]\s*(?:20|19)\d{2}|(?:20|19)\d{2}\s*[------]\s*present)(.+?)(?=(?:20|19)\d{2}|\Z)', text, re.DOTALL)
        
        # If no experience matches found, try another approach
        if not exp_matches:
            # Look for common experience section headers and extract paragraphs after them
            exp_section = re.search(r'(?i)(?:experience|work history|employment)[\s:]*(.+?)(?:(?:\n\n.*?(?:education|skills|projects|references))|$)', text, re.DOTALL)
            if exp_section:
                exp_text = exp_section.group(1)
                # Split into paragraphs that might be individual experiences
                exp_paragraphs = [p for p in exp_text.split('\n\n') if len(p.strip()) > 50]  # Minimum paragraph size
                
                # Create experience entries from paragraphs
                for i, paragraph in enumerate(exp_paragraphs[:3]):  # Limit to 3
                    sections['experience'].append({
                        'duration': 'Not specified',
                        'description': re.sub(r'[^\w\s\-.,:()/\'\"]', '', paragraph.strip())
                    })
        
        # Process regular experience matches if found
        for i, (duration, desc) in enumerate(exp_matches[:3]):
            # Clean the text by removing problematic characters
            duration_clean = re.sub(r'[^\w\s\------]', '', duration.strip())
            desc_clean = re.sub(r'[^\w\s\-.,:()/\'\"]', '', desc.strip())
            
            sections['experience'].append({
                'duration': duration_clean,
                'description': desc_clean
            })
        
        # Ensure experience has at least one entry as a fallback
        if not sections['experience']:
            sections['experience'].append({
                'duration': 'Not specified',
                'description': 'Experience information could not be clearly extracted from this resume.'
            })
        
        # Extract education with improved parsing
        edu_section = re.search(r'(?i)education[\s:]*(.+?)(?:\n\n|\Z)', text, re.DOTALL)
        if edu_section:
            edu_text = edu_section.group(1)
            
            # Try multiple approaches to extract education info
            degrees = re.findall(r'((?:B\.?S\.?|M\.?S\.?|Ph\.?D\.?|Bachelor|Master|Doctorate|Associate|MBA)[\s\S]*?)(?:\n\n|\Z)', edu_text, re.DOTALL)
            
            # If no matches, try a more general approach
            if not degrees:
                # Split by double newlines or typical education separators
                degrees = [part.strip() for part in re.split(r'\n\n|\n(?=University|College|Institute|School)', edu_text) if part.strip()]
            
            # Use at most 2 entries
            for degree_text in degrees[:2]:
                # Clean the text by removing problematic characters
                cleaned_degree = re.sub(r'[^\w\s\-.,:()/\'\"]', '', degree_text.strip())
                
                # Try to identify components
                institution = ""
                degree_part = cleaned_degree
                
                # Try to identify institution
                university_match = re.search(r'(University|College|Institute|School)[\s\S]*?', cleaned_degree)
                if university_match:
                    institution = university_match.group(0).strip()
                
                # Add using a very simple structure to avoid JSON issues
                sections['education'].append({
                    'degree': degree_part[:150] if degree_part else "Not specified",  # Limit length
                    'institution': institution[:150] if institution else "Not specified"  # Limit length
                })
        
        # Ensure at least one education entry
        if not sections['education']:
            sections['education'].append({
                'degree': "Not specified",
                'institution': "Education information could not be clearly extracted"
            })
        
        # Calculate approximate experience years with better fallback
        total_experience_years = 0
        for exp in sections['experience']:
            duration_str = exp.get('duration', '')
            # Simple calculation based on year range
            years_match = re.findall(r'(19|20)\d{2}', duration_str)
            if len(years_match) >= 2:
                try:
                    start_year = int(years_match[0])
                    end_year = int(years_match[1]) if 'present' not in duration_str.lower() else 2025
                    total_experience_years += (end_year - start_year)
                except (ValueError, IndexError):
                    pass
        
        # If we couldn't calculate experience, estimate based on content
        if total_experience_years == 0:
            if len(sections['experience']) >= 3:
                total_experience_years = 5  # Multiple jobs usually indicates some experience
            elif len(sections['experience']) >= 1:
                total_experience_years = 2  # At least one job
            
            # Check for keywords indicating senior positions
            senior_keywords = ['senior', 'lead', 'manager', 'director', 'head']
            for exp in sections['experience']:
                desc = exp.get('description', '').lower()
                if any(keyword in desc for keyword in senior_keywords):
                    total_experience_years = max(total_experience_years, 5)
        
        sections['total_experience_years'] = total_experience_years
        
        # Make sure we don't have problematic structures in the data
        return ensure_json_serializable(sections)
    
    except Exception as e:
        logger.error(f"Error in parse_pdf_to_cv_data: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a complete fallback structure that satisfies the model requirements
        return {
            'summary': f'Error parsing PDF: {str(e)}',
            'experience': [{'duration': 'Not available', 'description': 'Error occurred during parsing'}],
            'education': [{'degree': 'Not available', 'institution': 'Not available'}],
            'skills': ['Error occurred during parsing'],
            'accomplishments': [],
            'total_experience_years': 0
        }