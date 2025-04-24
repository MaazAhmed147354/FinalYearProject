import re
import pdfplumber
from model import CVEvaluationSystem

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
    sections['summary'] = text.split('\n\n')[0].strip()
    
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
    
    return sections

def main():
    # Initialize the evaluation system
    eval_system = CVEvaluationSystem()

    # Set evaluation criteria
    requirements = {
    'min_experience_years': 1,
    'required_skills': ['Customer Service', 'Front Desk', 'Guest Relations'],
    'education_level': 'associate', 
    'keywords': ['hospitality', 'service', 'banquet'],
    'industry_specific_weights': {
        'hospitality': {
            'customer_service': 0.30,
            'operations': 0.20
        }
    }
}
    eval_system.set_requirements(requirements)

    # Parse and evaluate each CV
    cv_files = ['first.pdf', 'second.pdf', 'third.pdf']
    parsed_cvs = {}
    
    for cv_file in cv_files:
        try:
            parsed_cvs[cv_file] = parse_pdf_to_cv_data(cv_file)
            print(f"Parsed {cv_file} successfully")
        except Exception as e:
            print(f"Failed to parse {cv_file}: {str(e)}")
    
    if parsed_cvs:
        results = eval_system.evaluate_multiple_cvs(parsed_cvs)
        
        print("\n=== Evaluation Results ===")
        for report in results['individual_reports']:
            print(f"\nCV: {report['cv_id']}")
            print(f"Score: {report['report']['evaluation_summary']['total_score']}/100")
            print(f"Decision: {report['report']['evaluation_summary']['decision']}")
            
            print("\nStrengths:")
            for s in report['report']['evaluation_summary']['strengths']:
                print(f"- {s}")
            
            print("\nWeaknesses:")
            for w in report['report']['evaluation_summary']['weaknesses']:
                print(f"- {w}")
            
            print("\nRequirements:")
            for req, met in report['meets_requirements'].items():
                print(f"- {req}: {'✔' if met else '✘'}")
            
            print("\n" + "="*50)
        
        summary = results['summary_report']
        print("\n=== Summary ===")
        print(f"Total CVs: {summary['total_cvs_evaluated']}")
        print(f"Average Score: {summary['average_score']}")
        print(f"Met Requirements: {summary['meets_requirements_count']}/{summary['total_cvs_evaluated']}")
        
        print("\nTop Strengths:")
        for s, count in summary['common_strengths']:
            print(f"- {s} ({count} CVs)")
        
        print("\nTop Weaknesses:")
        for w, count in summary['common_weaknesses']:
            print(f"- {w} ({count} CVs)")

if __name__ == "__main__":
    main()