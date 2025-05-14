import json
import os
import tempfile
from model import CVEvaluationSystem
import pdfplumber
import re
import traceback
import logging
import warnings

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress all pdfminer warnings
logging.getLogger('pdfminer').setLevel(logging.ERROR)
warnings.filterwarnings('ignore', category=UserWarning, module='pdfminer')
warnings.filterwarnings('ignore', category=FutureWarning, module='re')

def parse_resume(event, context):
    """
    Lambda handler for parsing resumes
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
        
        # Configure pdfplumber settings with compatible parameters
        laparams = {
            'all_texts': True,
            'detect_vertical': True,
            'line_overlap': 0.5,
            'char_margin': 2.0,
            'line_margin': 0.5,
            'word_margin': 0.1,
            'boxes_flow': 0.5
        }
        
        # Open PDF with more robust error handling
        try:
            with pdfplumber.open(pdf_path, laparams=laparams) as pdf:
                # Adjust max pages based on file size
                max_pages = 1 if file_size > 5_000_000 else min(3, len(pdf.pages))
                logger.info(f"Processing {max_pages} pages from PDF")
                
                # Process with page timeout
                extracted_text = []
                for i in range(max_pages):
                    try:
                        page = pdf.pages[i]
                        # Set default CropBox to MediaBox if missing
                        if not hasattr(page, 'cropbox'):
                            page.cropbox = page.mediabox
                        # Extract text with better error handling
                        try:
                            page_text = page.extract_text(x_tolerance=3, y_tolerance=3)
                            if page_text:
                                # Clean up text
                                page_text = ' '.join(page_text.split())  # Remove excessive whitespace
                                extracted_text.append(page_text)
                        except Exception as text_err:
                            logger.warning(f"Error extracting text from page {i}: {str(text_err)}")
                            continue
                    except Exception as e:
                        logger.error(f"Error processing page {i}: {str(e)}")
                        continue
                
                text = "\n".join(extracted_text)
                
                # Add basic validation of extracted text
                if not text or len(text.strip()) < 50:  # Minimum reasonable length
                    logger.warning("Extracted text is too short or empty")
                    return {
                        'summary': 'Could not extract meaningful text from the PDF.',
                        'experience': [{'duration': 'Not specified', 'description': 'Text extraction failed'}],
                        'education': [{'degree': 'Not specified', 'institution': 'Not specified'}],
                        'skills': ['Text extraction failed'],
                        'total_experience_years': 0
                    }
                    
                logger.info(f"Successfully extracted {len(text)} characters of text")
                
        except Exception as pdf_err:
            logger.error(f"Error opening PDF: {str(pdf_err)}")
            return {
                'summary': f'Error opening PDF: {str(pdf_err)}',
                'experience': [{'duration': 'Not specified', 'description': 'Could not read PDF file'}],
                'education': [{'degree': 'Not specified', 'institution': 'Not specified'}],
                'skills': ['Not extracted due to file read error'],
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
        
        # Extract skills (simpler regex)
        skills_match = re.search(r'(?i)skills[\s:]*(.+?)(?:\n\n|\Z)', text, re.DOTALL)
        if skills_match:
            skills_text = skills_match.group(1)
            # Simple split by common delimiters
            skills_list = [s.strip() for s in re.split(r'[,•\n]', skills_text) if s.strip()]
            sections['skills'] = skills_list
        
        # Simple experience extraction with fixed regex
        exp_pattern = r'(?i)((?:20|19)\d{2}\s*[-–—]\s*(?:(?:20|19)\d{2}|present|current|now))(.+?)(?=(?:(?:20|19)\d{2})|$)'
        exp_matches = re.findall(exp_pattern, text, re.DOTALL | re.IGNORECASE)
        
        # Process experience matches
        for i, (duration, desc) in enumerate(exp_matches[:3]):  # Limit to 3 entries
            sections['experience'].append({
                'duration': duration.strip(),
                'description': desc.strip()
            })
        
        # Ensure experience has at least one entry
        if not sections['experience']:
            sections['experience'].append({
                'duration': 'Not specified',
                'description': 'Experience information could not be extracted from this resume.'
            })
        
        # Extract education (simplified)
        edu_section = re.search(r'(?i)education[\s:]*(.+?)(?:\n\n|\Z)', text, re.DOTALL)
        if edu_section:
            edu_text = edu_section.group(1)
            sections['education'].append({
                'degree': edu_text[:150].strip(),  # Limit length
                'institution': 'Not specified'
            })
        else:
            sections['education'].append({
                'degree': 'Not specified',
                'institution': 'Education information could not be extracted'
            })
        
        # Calculate total experience (simplified)
        total_experience_years = 0
        for exp in sections['experience']:
            duration_str = exp.get('duration', '')
            years_match = re.findall(r'(19|20)\d{2}', duration_str)
            if len(years_match) >= 2:
                try:
                    start_year = int(years_match[0])
                    end_year = int(years_match[1]) if not any(x in duration_str.lower() for x in ['present', 'current', 'now']) else 2024
                    total_experience_years += (end_year - start_year)
                except (ValueError, IndexError):
                    pass
        
        sections['total_experience_years'] = total_experience_years
        
        return sections
    
    except Exception as e:
        logger.error(f"Error in parse_pdf_to_cv_data: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            'summary': f'Error parsing PDF: {str(e)}',
            'experience': [{'duration': 'Not available', 'description': 'Error occurred during parsing'}],
            'education': [{'degree': 'Not available', 'institution': 'Not available'}],
            'skills': ['Error occurred during parsing'],
            'accomplishments': [],
            'total_experience_years': 0
        }

def parseResume(event, context):
    """
    Lambda handler for parsing resumes
    Expected input:
      - file_path: Path to the PDF file
    """
    return parse_resume(event, context)  # Delegate to original implementation for backward compatibility

# Export the Lambda handlers
parseResume = parseResume
evaluateResume = evaluate_resume