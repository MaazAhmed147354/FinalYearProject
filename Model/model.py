import re
from collections import defaultdict
from datetime import datetime
from dateutil import parser

class CVEvaluationSystem:
    def __init__(self):
        self.evaluation_criteria = {
            'required_sections': ['summary', 'experience', 'education', 'skills'],
            'min_experience_years': 2,
            'required_skills': [],
            'education_level': None,
            'keywords': [],
            'preferred_industries': [],
            'industry_specific_weights': {
                'finance': {
                    'experience': 0.35,
                    'certifications': 0.15,
                    'technical_skills': 0.25
                },
                'media': {
                    'creativity': 0.20,
                    'project_management': 0.25,
                    'technical_skills': 0.15
                },
                'hospitality': {
                    'customer_service': 0.30,
                    'operations': 0.25,
                    'technical_skills': 0.15
                },
                'social_services': {
                    'case_management': 0.30,
                    'client_relations': 0.25,
                    'crisis_intervention': 0.20
                },
                'customer_service': {
                    'customer_service': 0.40,
                    'technical_skills': 0.20,
                    'problem_solving': 0.15
                },
                'natural_resources': {
                    'field_experience': 0.35,
                    'technical_skills': 0.25,
                    'regulatory_knowledge': 0.20
                },
                'retail_fashion': {
                    'sales_performance': 0.30,
                    'team_leadership': 0.25,
                    'customer_service': 0.25,
                    'business_development': 0.20
                },
                'beauty_cosmetics': {
                    'artistry_skills': 0.30,
                    'customer_service': 0.25,
                    'sales_performance': 0.20,
                    'product_knowledge': 0.15,
                    'creativity': 0.10
                },
                'hospitality_food': {
                    'customer_service': 0.35,
                    'food_safety': 0.20,
                    'pos_systems': 0.15,
                    'upselling': 0.15,
                    'teamwork': 0.15
                },
                'arts_education': {
                    'curriculum_development': 0.30,
                    'teaching_experience': 0.25,
                    'artistic_skills': 0.20,
                    'technology_integration': 0.15,
                    'leadership': 0.10
                },
                'it_architecture': {
                    'technical_skills': 0.30,
                    'project_management': 0.25,
                    'team_leadership': 0.20,
                    'solution_design': 0.15,
                    'industry_knowledge': 0.10
                },
                'education_administration': {
                    'leadership': 0.30,
                    'policy_implementation': 0.25,
                    'budget_management': 0.20,
                    'staff_development': 0.15,
                    'academic_improvement': 0.10
                },
                'military_aviation': {
                    'technical_skills': 0.25,
                    'leadership': 0.25,
                    'training_development': 0.20,
                    'safety_compliance': 0.15,
                    'operational_experience': 0.15
                },
                'entry_level_service': {
                    'customer_service': 0.35,
                    'teamwork': 0.25,
                    'multitasking': 0.20,
                    'technical_skills': 0.10,
                    'safety_compliance': 0.10
                },
                'financial_services': {
                    'financial_analysis': 0.30,
                    'client_management': 0.25,
                    'regulatory_compliance': 0.20,
                    'portfolio_management': 0.15,
                    'technical_skills': 0.10
                },
                'entry_level_finance': {
                    'financial_analysis': 0.35,
                    'academic_achievement': 0.25,
                    'technical_skills': 0.20,
                    'client_service': 0.15,
                    'teamwork': 0.05
                },
                'bpo_operations': {
                    'operations_management': 0.30,
                    'team_leadership': 0.25,
                    'performance_metrics': 0.20,
                    'client_management': 0.15,
                    'process_improvement': 0.10
                },
                'customer_service': {
                    'customer_relations': 0.35,
                    'multilingual': 0.20,
                    'problem_solving': 0.20,
                    'technical_skills': 0.15,
                    'teamwork': 0.10
                },
                'general': {
                    'experience': 0.30,
                    'education': 0.20,
                    'skills': 0.20
                }
            }
        }
    
    def set_requirements(self, requirements):
        for key, value in requirements.items():
            if key in self.evaluation_criteria:
                if key == 'industry_specific_weights' and isinstance(value, dict):
                    self.evaluation_criteria[key].update(value)
                else:
                    self.evaluation_criteria[key] = value
    
    def evaluate_multiple_cvs(self, cvs_data):
        reports = []
        for cv_id, cv_data in cvs_data.items():
            industry = self._detect_industry(cv_data)
            evaluation = self._evaluate_cv(cv_data, industry)
            report = self._generate_report(evaluation, cv_data, industry)
            meets_reqs = self._check_requirements(evaluation, industry)
            reports.append({
                'cv_id': cv_id,
                'industry': industry,
                'report': report,
                'meets_requirements': meets_reqs
            })
        
        return {
            'individual_reports': reports,
            'summary_report': self._generate_summary_report(reports)
        }
    
    def _detect_industry(self, cv_data):
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()

        # Enhanced industry detection with new categories
        finance_keywords = {
            'financial': 2, 'accounting': 2, 'audit': 2, 'tax': 1.5, 
            'gaap': 1.5, 'reconciliation': 1.5, 'ledger': 1.5,
            'accounts payable': 2, 'accounts receivable': 2, 'cpa': 1.5,
            'portfolio': 1.5, 'investment': 1.5, 'derivative': 1.5
        }
        
        media_keywords = ['media', 'marketing', 'public relations', 'content']
        hospitality_keywords = ['hotel', 'culinary', 'hospitality', 'guest']
        social_services_keywords = {
            'victim': 2, 'advocate': 2, 'case management': 2, 'crisis': 1.5,
            'social work': 2, 'counseling': 1.5, 'community': 1
        }
        customer_service_keywords = {
            'customer service': 2, 'call center': 2, 'client relations': 1.5,
            'customer advocate': 2, 'support': 1, 'help desk': 1.5
        }
        natural_resources_keywords = {
            'natural resource': 3, 'rangeland': 3, 'conservation': 2.5,
            'environmental': 2, 'wildlife': 2, 'forestry': 2,
            'agriculture': 2, 'grazing': 2.5, 'watershed': 2,
            'ecology': 1.5, 'bureau of land management': 2.5,
            'animal unit months': 2, 'aums': 2, 'soil': 1.5
        }
        retail_fashion_keywords = {
            'retail': 2, 'fashion': 2, 'apparel': 2, 'luxury': 1.5,
            'merchandise': 1.5, 'boutique': 1.5, 'department store': 2,
            'sales goals': 1.5, 'client development': 1.5, 'brand imaging': 1.5
        }
        beauty_cosmetics_keywords = {
            'makeup': 3, 'cosmetics': 2, 'beauty': 2, 'artistry': 1.5,
            'skincare': 1.5, 'stylist': 1.5, 'bridal': 1, 'makeover': 1,
            'product knowledge': 1.5, 'clienteling': 1.5
        }
        hospitality_food_keywords = {
            'food server': 3, 'restaurant': 2, 'pos system': 2, 'cash handling': 2,
            'upselling': 1.5, 'food safety': 1.5, 'wait staff': 1.5, 'crew trainer': 1.5,
            'casino': 1, 'barista': 1, 'bartender': 1
        } 
        arts_education_keywords = {
            'art education': 3, 'curriculum': 2, 'teaching': 2, 'lesson plan': 2,
            'art instructor': 2, 'classroom': 1.5, 'student': 1.5, 'pedagogy': 1.5,
            'ceramics': 1, 'photography': 1, 'visual arts': 1
        }
        it_architecture_keywords = {
            'mdm': 3, 'master data management': 3, 'architecture': 2, 
            'tibco': 2, 'solution design': 2, 'enterprise': 1.5,
            'integration': 1.5, 'data modeling': 1.5, 'technical lead': 1.5
        }
        education_admin_keywords = {
            'principal': 3, 'deputy principal': 3, 'education administration': 2,
            'school improvement': 2, 'curriculum': 1.5, 'policy development': 1.5,
            'budget management': 1.5, 'staff evaluation': 1.5, 'academic leadership': 1.5
        }
        military_aviation_keywords = {
            'aviation': 3, 'warrant officer': 3, 'pilot': 2, 'flight': 2,
            'standardization': 1.5, 'aircrew': 1.5, 'rotary-wing': 1.5,
            'combat': 1, 'medevac': 1, 'nvg': 1
        }
        entry_level_service_keywords = {
            'customer service': 3, 'retail': 2, 'food service': 2,
            'security': 1.5, 'warehouse': 1.5, 'forklift': 1,
            'cashier': 1, 'call center': 1, 'shift manager': 1
        }
        financial_services_keywords = {
            'vice president': 3, 'portfolio': 2, 'underwrote': 2, 
            'fannie mae': 1.5, 'freddie mac': 1.5, 'treasury': 1.5,
            'loan production': 1.5, 'credit union': 1, 'small business banking': 2
        }
        entry_level_finance_keywords = {
            'internship': 2, 'assistant': 2, 'graduate': 1.5,
            'entry level': 2, 'financial modeling': 1.5, 'analysis': 1.5,
            'student': 1, 'master': 1, 'bachelor': 1
        }
        bpo_operations_keywords = {
            'bpo': 3, 'call center': 2, 'operations management': 2,
            'kpi': 1.5, 'sales performance': 1.5, 'conversion metrics': 1.5,
            'p&l': 1, 'gross margin': 1, 'direct sales': 1.5
        }
        customer_service_keywords = {
            'customer service': 3, 'client relations': 2, 'customer support': 2,
            'call center': 1.5, 'problem resolution': 1.5, 'multilingual': 1.5,
            'help desk': 1, 'client retention': 1, 'customer satisfaction': 1.5
        }
        
        scores = {
            'finance': sum(weight for word, weight in finance_keywords.items() if word in text),
            'media': sum(1 for word in media_keywords if word in text),
            'hospitality': sum(1 for word in hospitality_keywords if word in text),
            'social_services': sum(weight for word, weight in social_services_keywords.items() if word in text),
            'customer_service': sum(weight for word, weight in customer_service_keywords.items() if word in text),
            'natural_resources': sum(weight for word, weight in natural_resources_keywords.items() if word in text),
            'retail_fashion': sum(weight for word, weight in retail_fashion_keywords.items() if word in text),
            'beauty_cosmetics': sum(weight for word, weight in beauty_cosmetics_keywords.items() if word in text),
            'hospitality_food': sum(weight for word, weight in hospitality_food_keywords.items() if word in text),
            'arts_education': sum(weight for word, weight in arts_education_keywords.items() if word in text),
            'it_architecture': sum(weight for word, weight in it_architecture_keywords.items() if word in text),
            'education_administration': sum(weight for word, weight in education_admin_keywords.items() if word in text),
            'military_aviation': sum(weight for word, weight in military_aviation_keywords.items() if word in text),
            'entry_level_service': sum(weight for word, weight in entry_level_service_keywords.items() if word in text),
            'financial_services': sum(weight for word, weight in financial_services_keywords.items() if word in text),
            'entry_level_finance': sum(weight for word, weight in entry_level_finance_keywords.items() if word in text),
            'bpo_operations': sum(weight for word, weight in bpo_operations_keywords.items() if word in text),
            'customer_service': sum(weight for word, weight in customer_service_keywords.items() if word in text)
        }
        
        max_industry = max(scores, key=scores.get)
        return max_industry if scores[max_industry] > 0 else 'general'
    
    def _evaluate_cv(self, cv_data, industry):
        evaluator = CVEvaluator(self.evaluation_criteria, industry)
        return evaluator.evaluate(cv_data)
    
    def _generate_report(self, evaluation, cv_data, industry):
        return {
            'candidate_info': self._extract_candidate_info(cv_data),
            'evaluation_summary': {
                'total_score': evaluation['total_score'],
                'decision': self._make_decision(evaluation['total_score'], industry),
                'strengths': [fb for fb in evaluation['feedback'] if 'strong' in fb or 'impressive' in fb],
                'weaknesses': [fb for fb in evaluation['feedback'] if 'could be improved' in fb or 'missing' in fb],
                'industry': industry
            },
            'score_breakdown': evaluation['score_breakdown'],
            'full_feedback': evaluation['feedback'],
            'extracted_data': cv_data
        }
    
    def _check_requirements(self, evaluation, industry):
        checks = {
            'min_experience': True,
            'required_skills': True,
            'education_level': True,
            'keywords': True,
            'industry_specific': True
        }
        
        criteria = self.evaluation_criteria
        scores = evaluation['score_breakdown']
        data = evaluation['extracted_data']
        
        if criteria['min_experience_years'] > 0:
            checks['min_experience'] = scores['total_experience_years'] >= criteria['min_experience_years']
        
        if criteria['required_skills']:
            missing = [s for s in criteria['required_skills'] 
                    if s.lower() not in ' '.join(data.get('skills', [])).lower()]
            checks['required_skills'] = not missing
        
        if criteria['education_level']:
            levels = ['associate', 'bachelor', 'master', 'phd']
            req_idx = levels.index(criteria['education_level'])
            highest = self._get_highest_education(data.get('education', []))
            curr_idx = levels.index(highest.lower()) if highest and highest.lower() in levels else -1
            checks['education_level'] = curr_idx >= req_idx
        
        if criteria['keywords']:
            text = ' '.join([
                data.get('summary', ''),
                ' '.join(data.get('skills', [])),
                ' '.join([exp.get('description', '') for exp in data.get('experience', [])])
            ]).lower()
            matches = sum(1 for kw in criteria['keywords'] if kw.lower() in text)
            checks['keywords'] = matches >= len(criteria['keywords']) * 0.5
        
        # Industry-specific checks
        if industry == 'finance':
            checks['industry_specific'] = (
                scores.get('technical_skills_score', 0) >= 60 and
                scores.get('compliance_score', 0) >= 50
            )
        elif industry == 'media':
            checks['industry_specific'] = (
                scores.get('creativity_score', 0) >= 50 and
                scores.get('project_management_score', 0) >= 40
            )
        elif industry == 'hospitality':
            checks['industry_specific'] = (
                scores.get('customer_service_score', 0) >= 70 and
                scores.get('operations_score', 0) >= 50
            )
        elif industry == 'social_services':
            checks['industry_specific'] = (
                scores.get('case_management_score', 0) >= 60 and
                scores.get('crisis_intervention_score', 0) >= 50
            )
        elif industry == 'customer_service':
            checks['industry_specific'] = (
                scores.get('customer_service_score', 0) >= 65 and
                scores.get('problem_solving_score', 0) >= 50
            )
        elif industry == 'natural_resources':
            checks['industry_specific'] = (
                scores.get('field_experience_score', 0) >= 70 and
                scores.get('regulatory_knowledge_score', 0) >= 60
            )
        elif industry == 'retail_fashion':
            checks['industry_specific'] = (
                scores.get('sales_performance_score', 0) >= 60 and
                scores.get('team_leadership_score', 0) >= 50 and
                scores.get('business_development_score', 0) >= 40
            )
        elif industry == 'beauty_cosmetics':
            checks['industry_specific'] = (
                scores.get('artistry_skills_score', 0) >= 60 and
                scores.get('product_knowledge_score', 0) >= 50 and
                scores.get('creativity_score', 0) >= 40
            )
        elif industry == 'hospitality_food':
            checks['industry_specific'] = (
                scores.get('customer_service_score', 0) >= 70 and
                scores.get('food_safety_score', 0) >= 60 and
                scores.get('pos_systems_score', 0) >= 40
            )
        elif industry == 'arts_education':
            checks['industry_specific'] = (
                scores.get('curriculum_development_score', 0) >= 60 and
                scores.get('teaching_experience_score', 0) >= 50 and
                scores.get('artistic_skills_score', 0) >= 40
            )
        elif industry == 'it_architecture':
            checks['industry_specific'] = (
                scores.get('technical_skills_score', 0) >= 70 and
                scores.get('project_management_score', 0) >= 50 and
                scores.get('solution_design_score', 0) >= 40
            )
        elif industry == 'education_administration':
            checks['industry_specific'] = (
                scores.get('leadership_score', 0) >= 70 and
                scores.get('policy_implementation_score', 0) >= 50 and
                scores.get('budget_management_score', 0) >= 40
            )
        elif industry == 'military_aviation':
            checks['industry_specific'] = (
                scores.get('technical_skills_score', 0) >= 70 and
                scores.get('leadership_score', 0) >= 60 and
                scores.get('safety_compliance_score', 0) >= 50
            )
        elif industry == 'entry_level_service':
            checks['industry_specific'] = (
                scores.get('customer_service_score', 0) >= 65 and
                scores.get('teamwork_score', 0) >= 50 and
                scores.get('multitasking_score', 0) >= 40
            )
        elif industry == 'financial_services':
            checks['industry_specific'] = (
                scores.get('financial_analysis_score', 0) >= 70 and
                scores.get('client_management_score', 0) >= 50 and
                scores.get('regulatory_compliance_score', 0) >= 40
            )
        elif industry == 'entry_level_finance':
            checks['industry_specific'] = (
                scores.get('financial_analysis_score', 0) >= 60 and
                scores.get('academic_achievement_score', 0) >= 50 and
                scores.get('technical_skills_score', 0) >= 40
            )
        elif industry == 'bpo_operations':
            checks['industry_specific'] = (
                scores.get('operations_management_score', 0) >= 70 and
                scores.get('team_leadership_score', 0) >= 50 and
                scores.get('performance_metrics_score', 0) >= 40
            )
        elif industry == 'customer_service':
            checks['industry_specific'] = (
                scores.get('customer_relations_score', 0) >= 70 and
                scores.get('problem_solving_score', 0) >= 50 and
                scores.get('technical_skills_score', 0) >= 40
            )
        else:  # general
            checks['industry_specific'] = (
                scores.get('experience_quality', 0) >= 50 and
                scores.get('education_quality', 0) >= 40 and
                scores.get('skills_relevance', 0) >= 40
            )
        
        return checks
    
    def _extract_candidate_info(self, cv_data):
        summary = cv_data.get('summary', '')
        email = re.search(r'[\w\.-]+@[\w\.-]+', summary)
        phone = re.search(r'(\+?\d[\d\s-]{7,}\d)', summary)
        
        return {
            'name': self._extract_name(summary),
            'email': email.group(0) if email else 'Not found',
            'phone': phone.group(0) if phone else 'Not found',
            'experience_years': self._calculate_total_experience(cv_data.get('experience', [])),
            'highest_education': self._get_highest_education(cv_data.get('education', []))
        }
    
    def _extract_name(self, text):
        lines = text.split('\n')
        return lines[0].strip() if lines else "Not found"
    
    def _calculate_total_experience(self, experiences):
        total_months = sum(self._parse_duration(exp.get('duration', '')) for exp in experiences)
        return round(total_months / 12, 1)
    
    def _parse_duration(self, duration_str):
        if not duration_str:
            return 0
        
        # Handle present case
        if 'present' in duration_str.lower() or 'current' in duration_str.lower():
            end_date = datetime.now()
        else:
            end_date = None
        
        # Try to parse date ranges (MM/YYYY to MM/YYYY or Month YYYY to Month YYYY)
        date_pattern = r'(\d{1,2}/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})\s*to\s*(\d{1,2}/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|present|current)'
        dates = re.findall(date_pattern, duration_str, re.IGNORECASE)
        
        if dates:
            try:
                start_str = dates[0][0].replace(' ', '/')
                end_str = dates[0][1].replace(' ', '/') if not end_date else 'present'
                
                if '/' in start_str:
                    start = datetime.strptime(start_str, '%m/%Y')
                else:
                    start = datetime.strptime(start_str, '%b/%Y')
                
                if end_str.lower() in ['present', 'current']:
                    end = datetime.now()
                elif '/' in end_str:
                    end = datetime.strptime(end_str, '%m/%Y')
                else:
                    end = datetime.strptime(end_str, '%b/%Y')
                
                delta = end - start
                return delta.days // 30  # Approximate months
            except:
                pass

        # Try to extract years
        years_match = re.search(r'(\d+)\s*year', duration_str, re.IGNORECASE)
        if years_match:
            return int(years_match.group(1)) * 12
        
        # Try to extract months
        months_match = re.search(r'(\d+)\s*month', duration_str, re.IGNORECASE)
        if months_match:
            return int(months_match.group(1))
        
        # Default to 1 year if can't parse
        return 12
    
    def _get_highest_education(self, education_list):
        if not education_list:
            return None
        
        levels = []
        for edu in education_list:
            degree = edu.get('degree', '').lower()
            if 'phd' in degree or 'doctor' in degree:
                levels.append(4)
            elif 'master' in degree or 'mba' in degree:
                levels.append(3)
            elif 'bachelor' in degree or 'bs' in degree or 'ba' in degree:
                levels.append(2)
            elif 'associate' in degree or 'a.a.s' in degree:
                levels.append(1)
            else:
                levels.append(0)
        
        highest_level = max(levels) if levels else 0
        return {
            0: 'Other',
            1: 'Associate',
            2: 'Bachelor',
            3: 'Master',
            4: 'PhD'
        }.get(highest_level, 'Other')
    
    def _make_decision(self, score, industry):
        thresholds = {
            'finance': (85, 70, 55),
            'media': (80, 65, 50),
            'hospitality': (75, 60, 45),
            'social_services': (80, 65, 50),
            'customer_service': (75, 60, 45),
            'natural_resources': (80, 65, 50),
            'retail_fashion': (80, 65, 50),
            'beauty_cosmetics': (80, 65, 50),
            'hospitality_food': (75, 60, 45),
            'arts_education': (80, 65, 50),
            'it_architecture': (85, 70, 55),
            'education_administration': (80, 65, 50),
            'military_aviation': (85, 70, 55),
            'entry_level_service': (75, 60, 45),
            'financial_services': (85, 70, 55),
            'entry_level_finance': (80, 65, 50),
            'bpo_operations': (80, 65, 50),
            'customer_service': (75, 60, 45),
            'general': (80, 65, 50)
        }
        
        high, med, low = thresholds.get(industry, (80, 65, 50))
        
        if score >= high: return "Highly Recommended"
        if score >= med: return "Recommended"
        if score >= low: return "Maybe Consider"
        return "Not Recommended"
    
    def _generate_summary_report(self, reports):
        total = len(reports)
        avg = sum(r['report']['evaluation_summary']['total_score'] for r in reports) / total if total else 0
        meets = sum(1 for r in reports if all(r['meets_requirements'].values()))
        
        industry_dist = defaultdict(int)
        for r in reports:
            industry_dist[r['industry']] += 1
        
        decisions = defaultdict(int)
        for r in reports:
            decisions[r['report']['evaluation_summary']['decision']] += 1
        
        all_strengths = [s for r in reports for s in r['report']['evaluation_summary']['strengths']]
        all_weaknesses = [w for r in reports for w in r['report']['evaluation_summary']['weaknesses']]
        
        top_strengths = sorted(((s, all_strengths.count(s)) for s in set(all_strengths)), key=lambda x: -x[1])[:3]
        top_weaknesses = sorted(((w, all_weaknesses.count(w)) for w in set(all_weaknesses)), key=lambda x: -x[1])[:3]
        
        return {
            'total_cvs_evaluated': total,
            'average_score': round(avg, 1),
            'meets_requirements_count': meets,
            'meets_requirements_percentage': round((meets / total) * 100, 1) if total else 0,
            'industry_distribution': dict(industry_dist),
            'decision_distribution': dict(decisions),
            'common_strengths': top_strengths,
            'common_weaknesses': top_weaknesses
        }
    
class CVEvaluator:
    def __init__(self, criteria, industry):
        self.criteria = criteria
        self.industry = industry
        self.positive_keywords = {
            'achieved', 'increased', 'improved', 'developed', 
            'led', 'managed', 'created', 'implemented', 
            'awarded', 'recognized', 'quantifiable', 'metrics',
            'saved', 'optimized', 'streamlined', 'reduced',
            'resolved', 'identified', 'generated', 'secured',
            'designed', 'built', 'delivered', 'architected',
            'spearheaded', 'pioneered', 'transformed', 'enhanced'
        }
        self.negative_keywords = {
            'unemployed', 'terminated', 'fired', 
            'gap', 'criminal', 'conviction'
        }
        
        # Enhanced industry-specific positive keywords
        self.industry_positive_keywords = {
            'finance': [
                'compliance', 'audit', 'risk assessment', 'portfolio', 
                'underwriting', 'reconciliation', 'GAAP', 'financial reporting',
                'investment', 'derivatives', 'valuation', 'exposure', 'IBOR',
                'data governance', 'data quality', 'data architecture'
            ],
            'media': ['campaign', 'press release', 'social media', 'content creation'],
            'hospitality': ['guest satisfaction', 'front office', 'reservation'],
            'social_services': [
                'case management', 'crisis intervention', 'advocacy',
                'trauma-informed', 'victim services', 'community outreach'
            ],
            'customer_service': [
                'customer satisfaction', 'call center', 'client relations',
                'troubleshooting', 'problem resolution', 'service excellence'
            ],
            'natural_resources': [
                'conservation', 'rangeland', 'watershed', 'ecological',
                'regulatory', 'compliance', 'inventory', 'assessment',
                'mitigation', 'rehabilitation', 'grazing', 'AUMs',
                'animal unit months', 'range unit', 'allotment',
                'ArcGIS', 'TAAMs', 'noxious weed', 'soil conservation'
            ],
            'retail_fashion': [
                'sales growth', 'client retention', 'revenue increase',
                'team development', 'merchandising', 'visual presentation',
                'brand standards', 'key holder', 'inventory management'
            ],
            'beauty_cosmetics': [
                'artistry training', 'product knowledge', 'client consultation',
                'makeup application', 'bridal makeup', 'photo shoot',
                'fashion show', 'counter management', 'social media promotion'
            ],
            'hospitality_food': [
                'customer satisfaction', 'food handling', 'sanitation',
                'point of sale', 'menu knowledge', 'beverage service',
                'shift supervisor', 'training staff', 'health codes'
            ],
            'arts_education': [
                'curriculum design', 'lesson planning', 'student assessment',
                'art exhibition', 'teaching methods', 'classroom management',
                'art techniques', 'visual arts', 'creative development'
            ],
            'it_architecture': [
                'solution architecture', 'technical leadership', 'system integration',
                'data governance', 'project delivery', 'stakeholder management',
                'performance tuning', 'best practices', 'enterprise systems'
            ],
            'education_administration': [
                'student outcomes', 'academic excellence', 'staff development',
                'compliance management', 'strategic planning', 'performance metrics',
                'educational leadership', 'policy implementation', 'budget oversight'
            ],
            'military_aviation': [
                'flight hours', 'instructor pilot', 'mission planning',
                'safety compliance', 'crew resource management',
                'standard operating procedures', 'training development',
                'aerial operations', 'emergency procedures'
            ],
            'entry_level_service': [
                'customer satisfaction', 'point of sale', 'inventory management',
                'shift management', 'team collaboration', 'conflict resolution',
                'safety protocols', 'multitasking', 'process improvement'
            ],
            'financial_services': [
                'loan portfolio', 'risk management', 'regulatory compliance',
                'client acquisition', 'cross-selling', 'financial modeling',
                'cash flow analysis', 'credit analysis', 'underwriting'
            ],
            'entry_level_finance': [
                'financial analysis', 'academic projects', 'research',
                'data analysis', 'valuation', 'financial statements',
                'market research', 'investment analysis', 'excel modeling'
            ],
            'bpo_operations': [
                'operations management', 'performance metrics', 'kpi improvement',
                'team leadership', 'process improvement', 'client management',
                'sales conversion', 'revenue growth', 'profit margin'
            ],
            'customer_service': [
                'customer satisfaction', 'problem resolution', 'multilingual support',
                'client retention', 'service quality', 'call handling',
                'complaint management', 'customer experience', 'service metrics'
            ]
        }
    
    def evaluate(self, cv_data):
        base_scores = {
            'section_completeness': self._evaluate_completeness(cv_data),
            'experience_quality': self._evaluate_experience(cv_data.get('experience', [])),
            'education_quality': self._evaluate_education(cv_data.get('education', [])),
            'skills_relevance': self._evaluate_skills(cv_data.get('skills', [])),
            'achievements_quality': self._evaluate_achievements(cv_data.get('accomplishments', [])),
            'keyword_matching': self._evaluate_keywords(cv_data),
            'structure_quality': self._evaluate_structure(cv_data),
            'total_experience_years': self._calculate_total_experience(cv_data.get('experience', []))
        }
        
        industry_scores = self._evaluate_industry_specific(cv_data)
        base_scores.update(industry_scores)
        
        weights = self._get_weights()
        total_score = sum(base_scores[k] * weights.get(k, 0) for k in base_scores)
        total_score = max(0, min(100, total_score))
        
        return {
            'total_score': round(total_score, 1),
            'score_breakdown': base_scores,
            'feedback': self._generate_feedback(base_scores, cv_data),
            'extracted_data': cv_data
        }
    
    def _get_weights(self):
        weights = {
            'section_completeness': 0.10,
            'experience_quality': 0.30,
            'education_quality': 0.15,
            'skills_relevance': 0.20,
            'achievements_quality': 0.10,
            'keyword_matching': 0.05,
            'structure_quality': 0.05,
            'technical_skills_score': 0.05
        }
        
        if self.industry == 'finance':
            weights.update({
                'experience_quality': 0.35,
                'technical_skills_score': 0.15,
                'compliance_score': 0.10
            })
        elif self.industry == 'media':
            weights.update({
                'creativity_score': 0.15,
                'project_management_score': 0.10
            })
        elif self.industry == 'hospitality':
            weights.update({
                'customer_service_score': 0.20,
                'operations_score': 0.15
            })
        elif self.industry == 'social_services':
            weights.update({
                'case_management_score': 0.25,
                'crisis_intervention_score': 0.20,
                'client_relations_score': 0.15
            })
        elif self.industry == 'customer_service':
            weights.update({
                'customer_service_score': 0.35,
                'problem_solving_score': 0.15,
                'technical_skills_score': 0.10
            })
        elif self.industry == 'natural_resources':
            weights.update({
                'field_experience_score': 0.35,
                'technical_skills_score': 0.25,
                'regulatory_knowledge_score': 0.20,
                'education_quality': 0.20,
                'experience_quality': 0.25
            })
        elif self.industry == 'retail_fashion':
            weights.update({
                'sales_performance_score': 0.30,
                'team_leadership_score': 0.25,
                'customer_service_score': 0.25,
                'business_development_score': 0.20
            })
        elif self.industry == 'beauty_cosmetics':
            weights.update({
                'artistry_skills_score': 0.30,
                'customer_service_score': 0.25,
                'sales_performance_score': 0.20,
                'product_knowledge_score': 0.15,
                'creativity_score': 0.10
            })
        elif self.industry == 'hospitality_food':
            weights.update({
                'customer_service_score': 0.35,
                'food_safety_score': 0.20,
                'pos_systems_score': 0.15,
                'upselling_score': 0.15,
                'teamwork_score': 0.15
            })
        elif self.industry == 'arts_education':
            weights.update({
                'curriculum_development_score': 0.30,
                'teaching_experience_score': 0.25,
                'artistic_skills_score': 0.20,
                'technology_integration_score': 0.15,
                'leadership_score': 0.10
            })
        elif self.industry == 'it_architecture':
            weights.update({
                'technical_skills_score': 0.30,
                'project_management_score': 0.25,
                'team_leadership_score': 0.20,
                'solution_design_score': 0.15,
                'industry_knowledge_score': 0.10
            })
        elif self.industry == 'education_administration':
            weights.update({
                'leadership_score': 0.30,
                'policy_implementation_score': 0.25,
                'budget_management_score': 0.20,
                'staff_development_score': 0.15,
                'academic_improvement_score': 0.10
            })
        elif self.industry == 'military_aviation':
            weights.update({
                'technical_skills_score': 0.25,
                'leadership_score': 0.25,
                'training_development_score': 0.20,
                'safety_compliance_score': 0.15,
                'operational_experience_score': 0.15
            })
        elif self.industry == 'entry_level_service':
            weights.update({
                'customer_service_score': 0.35,
                'teamwork_score': 0.25,
                'multitasking_score': 0.20,
                'technical_skills_score': 0.10,
                'safety_compliance_score': 0.10
            })
        elif self.industry == 'financial_services':
            weights.update({
                'financial_analysis_score': 0.30,
                'client_management_score': 0.25,
                'regulatory_compliance_score': 0.20,
                'portfolio_management_score': 0.15,
                'technical_skills_score': 0.10
            })
        elif self.industry == 'entry_level_finance':
            weights.update({
                'financial_analysis_score': 0.35,
                'academic_achievement_score': 0.25,
                'technical_skills_score': 0.20,
                'client_service_score': 0.15,
                'teamwork_score': 0.05
            })
        elif self.industry == 'bpo_operations':
            weights.update({
                'operations_management_score': 0.30,
                'team_leadership_score': 0.25,
                'performance_metrics_score': 0.20,
                'client_management_score': 0.15,
                'process_improvement_score': 0.10
            })
        
        return weights
    
    def _evaluate_industry_specific(self, cv_data):
        scores = {}
        if self.industry == 'finance':
            scores.update({
                'technical_skills_score': self._evaluate_finance_skills(cv_data.get('skills', [])),
                'compliance_score': self._evaluate_compliance(cv_data)
            })
        elif self.industry == 'media':
            scores.update({
                'creativity_score': self._evaluate_creativity(cv_data),
                'project_management_score': self._evaluate_project_management(cv_data.get('experience', []))
            })
        elif self.industry == 'hospitality':
            scores.update({
                'customer_service_score': self._evaluate_customer_service(cv_data),
                'operations_score': self._evaluate_operations(cv_data.get('experience', []))
            })
        elif self.industry == 'social_services':
            scores.update({
                'case_management_score': self._evaluate_case_management(cv_data),
                'crisis_intervention_score': self._evaluate_crisis_intervention(cv_data),
                'client_relations_score': self._evaluate_client_relations(cv_data)
            })
        elif self.industry == 'customer_service':
            scores.update({
                'customer_service_score': self._evaluate_customer_service(cv_data),
                'problem_solving_score': self._evaluate_problem_solving(cv_data),
                'technical_skills_score': self._evaluate_tech_skills(cv_data.get('skills', []))
            })
        elif self.industry == 'natural_resources':
            scores.update({
                'field_experience_score': self._evaluate_field_experience(cv_data),
                'regulatory_knowledge_score': self._evaluate_regulatory_knowledge(cv_data),
                'technical_skills_score': self._evaluate_natural_resources_skills(cv_data.get('skills', []))
            })
        elif self.industry == 'retail_fashion':
            scores.update({
                'sales_performance_score': self._evaluate_sales_performance(cv_data),
                'team_leadership_score': self._evaluate_team_leadership(cv_data),
                'business_development_score': self._evaluate_business_development(cv_data)
            })
        elif self.industry == 'beauty_cosmetics':
            scores.update({
                'artistry_skills_score': self._evaluate_artistry_skills(cv_data),
                'product_knowledge_score': self._evaluate_product_knowledge(cv_data),
                'creativity_score': self._evaluate_creativity(cv_data)
            })
        elif self.industry == 'hospitality_food':
            scores.update({
                'food_safety_score': self._evaluate_food_safety(cv_data),
                'pos_systems_score': self._evaluate_pos_systems(cv_data),
                'upselling_score': self._evaluate_upselling(cv_data),
                'teamwork_score': self._evaluate_teamwork(cv_data)
            })
        elif self.industry == 'arts_education':
            scores.update({
                'curriculum_development_score': self._evaluate_curriculum_development(cv_data),
                'teaching_experience_score': self._evaluate_teaching_experience(cv_data),
                'artistic_skills_score': self._evaluate_artistic_skills(cv_data),
                'technology_integration_score': self._evaluate_technology_integration(cv_data)
            })
        elif self.industry == 'it_architecture':
            scores.update({
                'technical_skills_score': self._evaluate_technical_skills(cv_data),
                'project_management_score': self._evaluate_project_management(cv_data),
                'team_leadership_score': self._evaluate_team_leadership(cv_data),
                'solution_design_score': self._evaluate_solution_design(cv_data)
            })
        elif self.industry == 'education_administration':
            scores.update({
                'leadership_score': self._evaluate_leadership(cv_data),
                'policy_implementation_score': self._evaluate_policy_implementation(cv_data),
                'budget_management_score': self._evaluate_budget_management(cv_data),
                'staff_development_score': self._evaluate_staff_development(cv_data)
            })
        elif self.industry == 'military_aviation':
            scores.update({
                'technical_skills_score': self._evaluate_aviation_technical_skills(cv_data),
                'leadership_score': self._evaluate_military_leadership(cv_data),
                'training_development_score': self._evaluate_training_development(cv_data),
                'safety_compliance_score': self._evaluate_safety_compliance(cv_data),
                'operational_experience_score': self._evaluate_operational_experience(cv_data)
            })
        elif self.industry == 'entry_level_service':
            scores.update({
                'customer_service_score': self._evaluate_customer_service(cv_data),
                'teamwork_score': self._evaluate_teamwork(cv_data),
                'multitasking_score': self._evaluate_multitasking(cv_data),
                'technical_skills_score': self._evaluate_service_tech_skills(cv_data),
                'safety_compliance_score': self._evaluate_service_safety(cv_data)
            })
        elif self.industry == 'financial_services':
            scores.update({
                'financial_analysis_score': self._evaluate_financial_analysis(cv_data),
                'client_management_score': self._evaluate_client_management(cv_data),
                'regulatory_compliance_score': self._evaluate_regulatory_compliance(cv_data),
                'portfolio_management_score': self._evaluate_portfolio_management(cv_data),
                'technical_skills_score': self._evaluate_finance_tech_skills(cv_data)
            })
        elif self.industry == 'entry_level_finance':
            scores.update({
                'financial_analysis_score': self._evaluate_entry_level_analysis(cv_data),
                'academic_achievement_score': self._evaluate_academic_achievement(cv_data),
                'technical_skills_score': self._evaluate_entry_tech_skills(cv_data),
                'client_service_score': self._evaluate_client_service(cv_data),
                'teamwork_score': self._evaluate_teamwork(cv_data)
            })
        elif self.industry == 'bpo_operations':
            scores.update({
                'operations_management_score': self._evaluate_operations_management(cv_data),
                'team_leadership_score': self._evaluate_bpo_leadership(cv_data),
                'performance_metrics_score': self._evaluate_performance_metrics(cv_data),
                'client_management_score': self._evaluate_client_management(cv_data),
                'process_improvement_score': self._evaluate_process_improvement(cv_data)
            })
        elif self.industry == 'customer_service':
            scores.update({
                'customer_relations_score': self._evaluate_customer_relations(cv_data),
                'multilingual_score': self._evaluate_multilingual(cv_data),
                'problem_solving_score': self._evaluate_problem_solving(cv_data),
                'technical_skills_score': self._evaluate_service_tech_skills(cv_data),
                'teamwork_score': self._evaluate_teamwork(cv_data)
            })
        
        return scores
    
    def _parse_duration(self, duration_str):
        try:
            dates = re.findall(r'(\w+\s+\d{4}|\d{1,2}/\d{4})', duration_str)
            if len(dates) == 2:
                start = parser.parse(dates[0])
                end = parser.parse(dates[1])
            elif len(dates) == 1 and 'present' in duration_str.lower():
                start = parser.parse(dates[0])
                end = datetime.today()
            else:
                return 0

            duration = (end.year - start.year) * 12 + (end.month - start.month)
            return max(duration / 12, 0)
        except Exception:
            return 0
    
    # Add new evaluation methods for BPO operations industry
    def _evaluate_operations_management(self, cv_data):
        ops_terms = [
            'operations management', 'team management', 'site management',
            'p&l', 'gross margin', 'revenue growth',
            'resource allocation', 'workforce planning'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in ops_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_bpo_leadership(self, cv_data):
        leadership_terms = [
            'team leadership', 'staff development', 'mentoring',
            'performance management', 'training', 'coaching',
            'employee engagement', 'supervision'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in leadership_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_performance_metrics(self, cv_data):
        metric_terms = [
            'kpi', 'key performance', 'metrics',
            'conversion rate', 'close ratio', 'arpu',
            'performance improvement', 'target achievement'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in metric_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_client_management(self, cv_data):
        client_terms = [
            'client management', 'account management', 'client relations',
            'stakeholder management', 'client retention', 'client satisfaction',
            'service level', 'sla'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in client_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_process_improvement(self, cv_data):
        improvement_terms = [
            'process improvement', 'efficiency', 'workflow',
            'optimization', 'streamlining', 'best practices',
            'standardization', 'methodology'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in improvement_terms if term in text)
        return min(100, matches * 20)
    
    # Add new evaluation methods for customer service industry
    def _evaluate_customer_relations(self, cv_data):
        service_terms = [
            'customer service', 'client relations', 'customer support',
            'help desk', 'call center', 'client retention',
            'customer satisfaction', 'service quality'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in service_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_multilingual(self, cv_data):
        languages = [
            'english', 'spanish', 'french',
            'german', 'portuguese', 'mandarin',
            'hindi', 'arabic'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for lang in languages if lang in text)
        return min(100, matches * 25)  # 25 points per language up to 100
    
    def _evaluate_problem_solving(self, cv_data):
        problem_terms = [
            'problem solving', 'conflict resolution', 'issue resolution',
            'troubleshooting', 'complaint handling', 'dispute resolution',
            'quick resolution', 'effective solution'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in problem_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_service_tech_skills(self, cv_data):
        tech_skills = [
            'crm', 'help desk', 'ticketing system',
            'call center', 'phone system', 'knowledge base',
            'service cloud', 'live chat'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in tech_skills if skill in text)
        return (matches / len(tech_skills)) * 100 if tech_skills else 0

    # Add new evaluation methods for financial services industry
    def _evaluate_financial_analysis(self, cv_data):
        analysis_terms = [
            'financial analysis', 'cash flow', 'valuation',
            'risk assessment', 'credit analysis', 'modeling',
            'forecasting', 'scenario analysis'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in analysis_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_client_management(self, cv_data):
        client_terms = [
            'client acquisition', 'relationship management',
            'portfolio growth', 'cross-selling', 'retention',
            'needs assessment', 'consultative'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in client_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_regulatory_compliance(self, cv_data):
        compliance_terms = [
            'compliance', 'regulatory', 'fannie mae',
            'freddie mac', 'fha', 'va', 'audit',
            'policy', 'procedures'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in compliance_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_portfolio_management(self, cv_data):
        portfolio_terms = [
            'portfolio', 'underwriting', 'loan production',
            'asset management', 'risk management', 'diversification',
            'performance metrics'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in portfolio_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_finance_tech_skills(self, cv_data):
        tech_skills = [
            'excel', 'financial modeling', 'vba',
            'database', 'crm', 'loan origination',
            'bloomberg', 'reuters'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in tech_skills if skill in text)
        return (matches / len(tech_skills)) * 100 if tech_skills else 0
    
    # Add new evaluation methods for entry-level finance industry
    def _evaluate_entry_level_analysis(self, cv_data):
        analysis_terms = [
            'financial analysis', 'data analysis', 'research',
            'valuation', 'modeling', 'forecasting',
            'market research', 'investment analysis'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in analysis_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_academic_achievement(self, cv_data):
        score = 0
        education = cv_data.get('education', [])
        for edu in education:
            if 'gpa' in edu.get('description', '').lower():
                gpa_match = re.search(r'gpa\s*[:of]?\s*(\d\.\d+)', edu.get('description', ''), re.IGNORECASE)
                if gpa_match:
                    gpa = float(gpa_match.group(1))
                    if gpa >= 3.5: score += 50
                    elif gpa >= 3.0: score += 30
            if 'scholarship' in edu.get('description', '').lower():
                score += 20
            if 'honor' in edu.get('description', '').lower():
                score += 10
        return min(100, score)
    
    def _evaluate_entry_tech_skills(self, cv_data):
        tech_skills = [
            'excel', 'powerpoint', 'word', 'vba',
            'financial modeling', 'statistical analysis',
            'database', 'prezi'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in tech_skills if skill in text)
        return (matches / len(tech_skills)) * 100 if tech_skills else 0
    
    def _evaluate_client_service(self, cv_data):
        service_terms = [
            'client service', 'customer service', 'assistance',
            'support', 'consultation', 'recommendations',
            'needs assessment'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in service_terms if term in text)
        return min(100, matches * 20)


    # Add new evaluation methods for military/aviation industry
    def _evaluate_aviation_technical_skills(self, cv_data):
        skills = [
            'flight planning', 'mission systems', 'avionics',
            'emergency procedures', 'nvg operations', 'instrumentation',
            'aircraft systems', 'maintenance', 'checklists'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in skills if skill in text)
        return (matches / len(skills)) * 100 if skills else 0
    
    def _evaluate_military_leadership(self, cv_data):
        leadership_terms = [
            'commander', 'supervisor', 'mentor',
            'team lead', 'standardization', 'evaluation',
            'performance review', 'resource management'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in leadership_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_training_development(self, cv_data):
        indicators = [
            'training program', 'curriculum', 'lesson plan',
            'instructor', 'teaching', 'coaching',
            'professional development', 'mentoring'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in indicators if term in text)
        return min(100, matches * 20)
    
    def _evaluate_safety_compliance(self, cv_data):
        safety_terms = [
            'safety', 'compliance', 'regulations',
            'checklists', 'procedures', 'standards',
            'risk management', 'emergency'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in safety_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_operational_experience(self, cv_data):
        # Score based on years of operational experience
        operational_titles = ['pilot', 'aircrew', 'maintainer', 'operator']
        total_years = 0
        for exp in cv_data.get('experience', []):
            if any(title in exp.get('title', '').lower() for title in operational_titles):
                duration = exp.get('duration', '')
                if duration:
                    years = self._parse_duration(duration) / 12
                    total_years += years
        return min(100, total_years * 20)  # 20 points per year up to 100
    
    # Add new evaluation methods for entry-level service industry
    def _evaluate_customer_service(self, cv_data):
        service_terms = [
            'customer service', 'client relations', 'customer satisfaction',
            'guest service', 'complaint resolution', 'customer needs',
            'point of sale', 'cash handling'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in service_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_teamwork(self, cv_data):
        teamwork_terms = [
            'teamwork', 'collaboration', 'team player',
            'shift coordination', 'staff training', 'mentoring',
            'peer support', 'crew'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in teamwork_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_multitasking(self, cv_data):
        multitask_terms = [
            'multitasking', 'multiple tasks', 'simultaneous',
            'while also', 'concurrently', 'during',
            'at the same time', 'in addition to'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in multitask_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_service_tech_skills(self, cv_data):
        tech_skills = [
            'point of sale', 'inventory system', 'computer',
            'software', 'database', 'spreadsheet',
            'security system', 'forklift'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in tech_skills if skill in text)
        return (matches / len(tech_skills)) * 100 if tech_skills else 0
    
    def _evaluate_service_safety(self, cv_data):
        safety_terms = [
            'safety', 'security', 'compliance',
            'regulations', 'procedures', 'emergency',
            'incident report', 'patrol'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in safety_terms if term in text)
        return min(100, matches * 20)


    # Add new evaluation methods for IT architecture industry
    def _evaluate_technical_skills(self, cv_data):
        skills = [
            'tibco mdm', 'data modeling', 'oracle', 'sql server',
            'java', 'j2ee', 'xml', 'ems', 'business events',
            'integration', 'data quality', 'patterns'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in skills if skill in text)
        return (matches / len(skills)) * 100 if skills else 0
    
    def _evaluate_project_management(self, cv_data):
        indicators = [
            'project management', 'delivery management', 'status reporting',
            'resource planning', 'stakeholder management', 'timeline',
            'milestones', 'go-live', 'implementation'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in indicators if term in text)
        return min(100, matches * 20)
    
    def _evaluate_team_leadership(self, cv_data):
        leadership_terms = [
            'team lead', 'mentor', 'coach', 'supervise',
            'performance review', 'resource management',
            'technical guidance', 'knowledge transfer'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in leadership_terms if term in text)
        return min(100, matches * 20)
    
    def _evaluate_solution_design(self, cv_data):
        design_terms = [
            'solution design', 'architecture', 'technical design',
            'system architecture', 'workflows', 'rule bases',
            'integration design', 'data flow'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in design_terms if term in text)
        return min(100, matches * 20)
    
    # Add new evaluation methods for education administration industry
    def _evaluate_leadership(self, cv_data):
        leadership_terms = [
            'principal', 'deputy principal', 'director',
            'school leadership', 'campus management',
            'strategic planning', 'decision making'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in leadership_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_policy_implementation(self, cv_data):
        policy_terms = [
            'policy development', 'compliance', 'state laws',
            'federal requirements', 'education code',
            'board policy', 'regulations'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in policy_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_budget_management(self, cv_data):
        budget_terms = [
            'budget management', 'fiscal oversight',
            'expenditure monitoring', 'fund allocation',
            'financial planning', 'resource allocation'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in budget_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_staff_development(self, cv_data):
        development_terms = [
            'staff development', 'professional growth',
            'teacher training', 'performance evaluation',
            'mentoring', 'coaching'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in development_terms if term in text)
        return min(100, matches * 20)
    
    # Add new evaluation methods for hospitality/food service industry
    def _evaluate_food_safety(self, cv_data):
        keywords = [
            'food safety', 'sanitation', 'health codes',
            'hygiene', 'cleanliness', 'food handling'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return min(100, matches * 25)  # Each match adds 25 points up to 100
    
    def _evaluate_pos_systems(self, cv_data):
        pos_terms = [
            'pos system', 'point of sale', 'cash register',
            'order processing', 'payment processing'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for term in pos_terms if term in text)
        return min(100, matches * 25)
    
    def _evaluate_upselling(self, cv_data):
        indicators = [
            'upsell', 'up-sell', 'increase sales',
            'additional items', 'promote specials',
            'suggestive selling'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in indicators if term in text)
        return min(100, matches * 25)
    
    def _evaluate_teamwork(self, cv_data):
        teamwork_terms = [
            'teamwork', 'crew', 'collaborate',
            'work well with others', 'team player',
            'training staff', 'mentor'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in teamwork_terms if term in text)
        return min(100, matches * 20)
    
    # Add new evaluation methods for arts education industry
    def _evaluate_curriculum_development(self, cv_data):
        indicators = [
            'curriculum design', 'lesson planning',
            'educational standards', 'rubric',
            'assessment', 'learning objectives'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in indicators if term in text)
        return min(100, matches * 25)
    
    def _evaluate_teaching_experience(self, cv_data):
        # Score based on years of teaching experience
        total_years = 0
        for exp in cv_data.get('experience', []):
            if 'instructor' in exp.get('title', '').lower() or 'teacher' in exp.get('title', '').lower():
                duration = exp.get('duration', '')
                if duration:
                    years = self._parse_duration(duration) / 12
                    total_years += years
        return min(100, total_years * 10)
    
    def _evaluate_artistic_skills(self, cv_data):
        skills = [
            'photography', 'ceramics', 'painting',
            'drawing', 'sculpture', 'printmaking',
            'graphic design', 'digital art', 'mixed media'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in skills if skill in text)
        return (matches / len(skills)) * 100 if skills else 0
    
    def _evaluate_technology_integration(self, cv_data):
        tech_terms = [
            'technology integration', 'computer lab',
            'digital tools', 'software', 'multimedia',
            'interactive', 'online resources'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in tech_terms if term in text)
        return min(100, matches * 25)
    
    # Add new evaluation methods for retail/fashion industry
    def _evaluate_sales_performance(self, cv_data):
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        
        # Look for sales performance indicators
        indicators = [
            r'increased (sales|revenue|business) by \d+%',
            r'\$\d+ (million|thousand)',
            r'achieved \d+% of sales goal',
            r'top sales',
            r'exceeded target'
        ]
        matches = sum(1 for pattern in indicators if re.search(pattern, text))
        return min(100, matches * 25)  # Each match adds 25 points up to 100
    
    def _evaluate_team_leadership(self, cv_data):
        leadership_terms = [
            'team building', 'coach', 'train', 'mentor', 'develop',
            'lead by example', 'performance feedback', 'empower',
            'motivate', 'groom for succession'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in leadership_terms if term in text)
        return min(100, matches * 20)  # Each match adds 20 points up to 100
    
    def _evaluate_business_development(self, cv_data):
        dev_terms = [
            'business growth', 'expand', 'develop', 'new market',
            'vendor relations', 'brand awareness', 'community relations',
            'strategic plan', 'maximize opportunities'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in dev_terms if term in text)
        return min(100, matches * 20)
    
    # Add new evaluation methods for beauty/cosmetics industry
    def _evaluate_artistry_skills(self, cv_data):
        skills = [
            'makeup application', 'hair styling', 'airbrushing',
            'special effects', 'prosthetics', 'digital design',
            'face chart', 'photo shoot', 'fashion show'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for skill in skills if skill in text)
        return (matches / len(skills)) * 100 if skills else 0
    
    def _evaluate_product_knowledge(self, cv_data):
        indicators = [
            'product knowledge', 'ingredients', 'brand training',
            'schooling sessions', 'artistry training', 'certification'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for term in indicators if term in text)
        return min(100, matches * 25)
    
    
    def _evaluate_field_experience(self, cv_data):
        keywords = [
            'field work', 'inventory', 'assessment', 'monitoring',
            'inspection', 'compliance check', 'range unit', 'allotment',
            'AUMs', 'animal unit months', 'grazing', 'conservation',
            'watershed', 'ecological', 'rehabilitation'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return min(100, (matches / len(keywords)) * 100) if keywords else 0
    
    def _evaluate_regulatory_knowledge(self, cv_data):
        keywords = [
            'regulation', 'compliance', 'policy', 'code of federal',
            'CFR', 'legal', 'permit', 'authorization', 'resolution',
            'mitigation', 'environmental assessment', 'EA', 'NEPA'
        ]
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return min(100, (matches / len(keywords)) * 100) if keywords else 0
    
    def _evaluate_natural_resources_skills(self, skills):
        relevant_skills = [
            'ArcGIS', 'TAAMs', 'GPS', 'Trimble', 'Garmin',
            'range management', 'soil conservation', 'watershed',
            'ecological', 'inventory', 'monitoring', 'compliance',
            'regulatory', 'environmental', 'conservation'
        ]
        matches = sum(1 for skill in skills if any(rs in skill.lower() for rs in relevant_skills))
        return (matches / len(relevant_skills)) * 100 if relevant_skills else 0
    
    def _evaluate_case_management(self, cv_data):
        keywords = ['case management', 'service plan', 'treatment plan', 'assessment']
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return (matches / len(keywords)) * 100
    
    def _evaluate_crisis_intervention(self, cv_data):
        keywords = ['crisis', 'emergency', 'intervention', 'trauma', 'safety plan']
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return (matches / len(keywords)) * 100
    
    def _evaluate_client_relations(self, cv_data):
        keywords = ['client', 'patient', 'relationship', 'rapport', 'trust']
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return (matches / len(keywords)) * 100
    
    def _evaluate_problem_solving(self, cv_data):
        keywords = ['resolved', 'solved', 'fixed', 'troubleshoot', 'improved']
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in keywords if kw in text)
        return min(100, matches * 20)
    
    def _evaluate_tech_skills(self, skills):
        tech_skills = ['software', 'system', 'database', 'microsoft', 'spreadsheet']
        matches = sum(1 for skill in skills if any(ts in skill.lower() for ts in tech_skills))
        return (matches / len(tech_skills)) * 100 if tech_skills else 0
    
    def _evaluate_finance_skills(self, skills):
        finance_skills = [
            'underwriting', 'risk management', 'compliance', 'loan processing', 
            'GAAP', 'financial reporting', 'accounts payable', 'accounts receivable'
        ]
        matches = sum(1 for skill in skills if any(fs in skill.lower() for fs in finance_skills))
        return (matches / len(finance_skills)) * 100 if finance_skills else 0
    
    def _evaluate_compliance(self, cv_data):
        compliance_keywords = ['compliance', 'regulation', 'audit', 'policy', 'standard']
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        matches = sum(1 for kw in compliance_keywords if kw in text)
        return (matches / len(compliance_keywords)) * 100
    
    def _evaluate_creativity(self, cv_data):
        creative_achievements = sum(1 for ach in cv_data.get('accomplishments', []) 
                                  if any(word in ach.lower() for word in ['created', 'developed', 'produced']))
        return min(100, creative_achievements * 20)
    
    def _evaluate_project_management(self, experiences):
        pm_experience = sum(1 for exp in experiences 
                           if any(word in exp.get('description', '').lower() 
                                 for word in ['managed', 'led', 'supervised']))
        return min(100, pm_experience * 15)
    
    def _evaluate_customer_service(self, cv_data):
        cs_keywords = ['customer service', 'client satisfaction', 'guest relations']
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])]),
            ' '.join(cv_data.get('skills', []))
        ]).lower()
        matches = sum(1 for kw in cs_keywords if kw in text)
        return (matches / len(cs_keywords)) * 100
    
    def _evaluate_operations(self, experiences):
        ops_experience = sum(1 for exp in experiences 
                            if any(word in exp.get('description', '').lower() 
                                  for word in ['operations', 'managed', 'team']))
        return min(100, ops_experience * 15)
    
    def _evaluate_completeness(self, cv_data):
        required = set(self.criteria['required_sections'])
        present = set(k for k in required if cv_data.get(k) and 
                     (not isinstance(cv_data[k], (list, str)) or len(cv_data[k]) > 0))
        return (len(present) / len(required)) * 100 if required else 100

    def _evaluate_experience(self, experiences):
        if not experiences:
            return 0
        
        total = 0
        for exp in experiences:
            score = 50  # Base score
            
            duration = self._parse_duration(exp.get('duration', ''))
            if duration > 36: score += 25
            elif duration > 24: score += 15
            elif duration > 12: score += 10
            
            desc = exp.get('description', '').lower()
            positive_words = sum(1 for w in self.positive_keywords if w in desc)
            score += min(25, positive_words * 3)
            
            if self.industry in self.industry_positive_keywords:
                industry_words = sum(1 for w in self.industry_positive_keywords[self.industry] if w in desc)
                score += min(15, industry_words * 3)
            
            negative_words = sum(1 for w in self.negative_keywords if w in desc)
            score -= negative_words * 5
            
            if re.search(r'\$\d+[MBK]?|\d+\s*(%|percent)|reduced by \d+', desc, re.IGNORECASE):
                score += 10
            
            total += max(0, min(100, score))
        
        return (total / len(experiences)) if experiences else 0
    
    def _evaluate_education(self, education):
        if not education:
            return 0
        
        total = 0
        for edu in education:
            score = 40  # Base score
            
            degree = edu.get('degree', '').lower()
            if 'phd' in degree: score += 30
            elif 'master' in degree: score += 20
            elif 'bachelor' in degree: score += 15
            elif 'associate' in degree: score += 10
            
            institution = edu.get('institution', '').lower()
            if 'university' in institution: score += 10
            elif 'college' in institution: score += 5
            
            if 'gpa' in edu.get('description', '').lower():
                gpa_match = re.search(r'gpa\s*[:of]?\s*(\d\.\d+)', edu.get('description', ''), re.IGNORECASE)
                if gpa_match:
                    gpa = float(gpa_match.group(1))
                    if gpa >= 3.5: score += 10
                    elif gpa >= 3.0: score += 5
            
            total += max(0, min(100, score))
        
        return (total / len(education)) if education else 0

    def _evaluate_skills(self, skills):
        if not skills:
            return 0
        
        total = 0
        required_skills = self.criteria.get('required_skills', [])
        
        for skill in skills:
            score = 5  # Base score
            
            if len(skill.split()) > 1:
                score += 3
            
            if required_skills and any(req.lower() in skill.lower() for req in required_skills):
                score += 2
            
            industry_keywords = []
            if self.industry == 'finance':
                industry_keywords = ['risk', 'compliance', 'gaap', 'accounting', 'portfolio', 'audit']
            elif self.industry == 'media':
                industry_keywords = ['content', 'social media', 'branding', 'campaign', 'public relations']
            elif self.industry == 'hospitality':
                industry_keywords = ['guest', 'service', 'hospitality', 'reservation', 'front desk']
            elif self.industry == 'social_services':
                industry_keywords = ['case management', 'crisis', 'advocacy', 'social work']
            elif self.industry == 'customer_service':
                industry_keywords = ['customer service', 'troubleshooting', 'support', 'help desk']
            elif self.industry == 'natural_resources':
                industry_keywords = ['arcgis', 'taams', 'conservation', 'wildlife', 'environmental']
            elif self.industry == 'retail_fashion':
                industry_keywords = ['sales', 'merchandising', 'retail', 'clienteling']
            elif self.industry == 'beauty_cosmetics':
                industry_keywords = ['makeup', 'cosmetics', 'artistry', 'skincare']
            elif self.industry == 'hospitality_food':
                industry_keywords = ['food safety', 'pos system', 'upselling', 'sanitation']
            elif self.industry == 'arts_education':
                industry_keywords = ['curriculum', 'teaching', 'visual arts', 'art education']
            elif self.industry == 'it_architecture':
                industry_keywords = ['architecture', 'data modeling', 'solution design', 'integration']
            elif self.industry == 'education_administration':
                industry_keywords = ['leadership', 'policy', 'budget', 'staff development']
            elif self.industry == 'military_aviation':
                industry_keywords = ['aviation', 'flight', 'safety compliance', 'training']
            elif self.industry == 'entry_level_service':
                industry_keywords = ['customer service', 'multitasking', 'safety', 'teamwork']
            elif self.industry == 'financial_services':
                industry_keywords = ['financial analysis', 'compliance', 'portfolio management', 'client relations']
            elif self.industry == 'entry_level_finance':
                industry_keywords = ['financial modeling', 'analysis', 'valuation', 'excel']
            elif self.industry == 'bpo_operations':
                industry_keywords = ['operations management', 'kpi', 'performance metrics', 'client management']
            
            if any(kw in skill.lower() for kw in industry_keywords):
                score += 3
            
            if any(software in skill.lower() for software in ['quickbooks', 'excel', 'database', 'crm', 'erp']):
                score += 2
            
            total += min(10, score)
        
        max_possible = len(skills) * 10
        return (total / max_possible) * 100 if max_possible > 0 else 0

    def _evaluate_achievements(self, achievements):
        if not achievements:
            return 0
        
        total = 0
        for ach in achievements:
            score = 30  # Base score
            
            if re.search(r'\$\d+[MBK]?|\d+\s*(%|percent)|reduced by \d+', ach, re.IGNORECASE):
                score += 30
            
            action_words = sum(1 for w in self.positive_keywords if w in ach.lower())
            score += min(40, action_words * 10)
            
            total += min(100, score)
        
        return (total / len(achievements)) if achievements else 0
    
    def _evaluate_keywords(self, cv_data):
        if not self.criteria['keywords']:
            return 50
        
        text = ' '.join([
            cv_data.get('summary', ''),
            ' '.join(cv_data.get('skills', [])),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ]).lower()
        
        matched_keywords = sum(1 for kw in self.criteria['keywords'] if kw.lower() in text)
        match_percentage = (matched_keywords / len(self.criteria['keywords'])) * 100
        
        return min(100, match_percentage * 1.5)
    
    def _evaluate_structure(self, cv_data):
        score = 50
        
        sections = [s.lower() for s in cv_data.keys()]
        if 'experience' in sections and 'education' in sections:
            if sections.index('experience') < sections.index('education'):
                score += 20
        
        content = ' '.join([
            cv_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in cv_data.get('experience', [])])
        ])
        bullet_points = content.count('•') + content.count('- ')
        if bullet_points >= 3: score += 15
        
        words = len(content.split())
        if 300 <= words <= 800: score += 15
        elif words > 1200: score -= 10
        
        return max(0, min(100, score))

    def _calculate_total_experience(self, experiences):
        total_months = sum(self._parse_duration(exp.get('duration', '')) for exp in experiences)
        return round(total_months / 12, 1)
    
    def _generate_feedback(self, scores, cv_data):
        feedback = []
        
        if scores['section_completeness'] < 100:
            missing = [s for s in self.criteria['required_sections'] 
                    if not cv_data.get(s) or (isinstance(cv_data[s], (list, str)) and not cv_data[s])]
            if missing:
                feedback.append(
                    f"Your CV is missing some critical sections: {', '.join(missing)}. "
                    f"It is important to include all major sections such as Summary, Experience, Education, and Skills "
                    f"to give a complete view of your profile. Recruiters expect these sections to quickly assess your fit. "
                    f"Consider carefully reviewing your resume template and ensuring all essential sections are covered. "
                    f"Missing sections can make your resume feel incomplete or less professional."
                )
        
        if scores['experience_quality'] < 70:
            feedback.append(
                "Your experience section needs improvement. Try to highlight specific accomplishments, "
                "mention quantifiable results (e.g., 'Increased sales by 20%'), and use active, strong verbs. "
                "Instead of just listing duties, focus on the impact you had in your previous roles. "
                "Recruiters value clear evidence of success. Also, ensure consistent formatting for job titles, dates, and companies."
            )
        elif scores['experience_quality'] >= 85:
            feedback.append(
                "Your experience section is a major strength. You have successfully included strong, quantifiable results "
                "and framed your achievements with action-driven language. "
                "Maintaining this focus on results and clarity will position you very well with recruiters. "
                "You may still consider fine-tuning bullet points for even sharper readability."
            )
        
        if scores['education_quality'] < 60:
            feedback.append(
                "The education section could be strengthened. Make sure to include your degree, major, university name, and graduation date. "
                "If you have honors, scholarships, or relevant coursework, be sure to mention them. "
                "Even if your education is not recent, showcasing it professionally adds to credibility. "
                "Consider using consistent formatting for clarity."
            )
        elif scores['education_quality'] >= 80:
            feedback.append(
                "Your educational background is impressive and clearly communicated. "
                "Listing relevant honors, projects, or coursework would make it even stronger. "
                "Ensure formatting remains clean and consistent for maximum impact. "
                "Consider adding certifications if relevant to the target job."
            )
        
        if scores['skills_relevance'] < 60:
            feedback.append(
                "Your skills section could be more aligned with the industry you are targeting. "
                "Prioritize listing technical skills, software, and industry-specific competencies. "
                "Avoid overly generic terms and instead match your skills to the job descriptions you're applying for. "
                "Grouping skills into categories (Technical, Communication, Leadership) can also improve readability."
            )
        elif scores['skills_relevance'] >= 80:
            feedback.append(
                "Your skills section is very strong, showing a direct match to industry needs. "
                "Continue tailoring your skills list for each application to maximize relevance. "
                "You might also consider adding a short technical or tools section if applying for specialized roles."
            )
        
        if scores['achievements_quality'] < 50:
            feedback.append(
                "Your achievements could be made more impactful by using numbers, percentages, or clear results. "
                "Phrases like 'Saved 10% annual costs' or 'Increased customer satisfaction by 15%' stand out strongly. "
                "Try to frame each accomplishment as a challenge, action, and result (CAR method). "
                "This makes your contributions immediately measurable and valuable to employers."
            )
        elif scores['achievements_quality'] >= 75:
            feedback.append(
                "Your achievements are a highlight of your resume. "
                "Quantifiable results and clear outcomes create a strong impression. "
                "Continue emphasizing measurable results in all future updates to maintain this high standard."
            )
        
        if scores['structure_quality'] < 60:
            feedback.append(
                "The structure of your CV could be improved. Use clear headings, bullet points, and logical section breaks. "
                "Avoid large text blocks; make content skimmable. "
                "Consistent use of fonts, alignment, and spacing dramatically improves first impressions. "
                "A clean structure can often be the difference between getting shortlisted or ignored."
            )
        elif scores['structure_quality'] >= 80:
            feedback.append(
                "Your CV is well-structured and easy to read. Clear headings and bullet points make it skimmable, "
                "which recruiters appreciate. "
                "Ensure you continue to keep formatting clean and avoid overcrowding information. "
                "Small improvements like optimizing margin spacing could still add polish."
            )
        
        # Industry-specific feedback
        if self.industry == 'finance':
            if scores.get('technical_skills_score', 0) < 60:
                feedback.append(
                "Your technical skills in finance could be strengthened. Highlight expertise in risk management, compliance frameworks, "
                "and financial analysis tools like Bloomberg or QuickBooks. Mention certifications or hands-on system experience. "
                "Employers in finance expect robust technical proficiency to manage complex financial operations."
                )
        
        elif self.industry == 'social_services':
            if scores.get('case_management_score', 0) < 60:
                feedback.append(
                    "Case management experience could be more clearly emphasized. Share examples of client assessments, treatment planning, "
                    "and service coordination. Describe any measurable outcomes or program success you contributed to. "
                    "Social services employers value hands-on experience with diverse populations."
                )
            if scores.get('crisis_intervention_score', 0) < 50:
                feedback.append(
                    "Your crisis intervention skills could be showcased better. Mention situations where you de-escalated crises, "
                    "provided emergency support, or worked with high-risk individuals. Certifications in mental health first aid or crisis management "
                    "would add credibility to your profile."
                )
        
        elif self.industry == 'customer_service':
            if scores.get('customer_service_score', 0) < 65:
                feedback.append(
                    "Customer service achievements could be highlighted more strongly. Share metrics like customer satisfaction ratings, "
                    "awards, or success stories. Recruiters look for evidence of excellent interpersonal skills and service consistency. "
                    "Consider adding short customer testimonials if appropriate."
                )
            if scores.get('problem_solving_score', 0) < 50:
                feedback.append(
                    "Problem-solving examples could be improved. Describe real scenarios where you resolved customer complaints, "
                    "improved service processes, or developed creative solutions under pressure. Concrete examples can greatly boost your appeal."
                )
        
        elif self.industry == 'natural_resources':
            if scores.get('field_experience_score', 0) < 60:
                feedback.append(
                    "More emphasis on field experience would strengthen your CV. Highlight work on environmental surveys, inspections, "
                    "conservation projects, or land management tasks. Mention certifications and technical fieldwork skills to stand out."
                )
            if scores.get('regulatory_knowledge_score', 0) < 50:
                feedback.append(
                    "Regulatory knowledge should be more prominent. Share your understanding of environmental laws like NEPA, "
                    "CFR regulations, or other compliance procedures you've followed. This showcases your preparedness for regulatory roles."
                )
            if scores.get('technical_skills_score', 0) < 50:
                feedback.append(
                    "Technical skills such as GIS, GPS data collection, and environmental software should be highlighted. "
                    "Discuss hands-on tools used in past projects. Specific technical proficiencies make a big difference in natural resources careers."
                )

        elif self.industry == 'retail_fashion':
            if scores.get('sales_performance_score', 0) < 60:
                feedback.append(
                    "Your sales achievements could be better emphasized. Mention specific sales targets achieved, upselling success, "
                    "or customer loyalty improvements. Numbers and results build credibility and attract retail hiring managers."
                )
            if scores.get('team_leadership_score', 0) < 50:
                feedback.append(
                    "Leadership examples in retail settings are important. Share stories where you motivated teams, improved sales performance, "
                    "or mentored junior associates. Team leadership in fast-paced environments is highly sought after."
                )
            if scores.get('business_development_score', 0) < 50:
                feedback.append(
                    "Business development initiatives should be more visible. Highlight strategies you contributed to for store growth, "
                    "new customer acquisition, or brand partnerships that enhanced performance."
                )
        
        elif self.industry == 'beauty_cosmetics':
            if scores.get('artistry_skills_score', 0) < 60:
                feedback.append(
                    "Artistry skills could be elaborated with more examples. Talk about specific makeup styles you specialize in, "
                    "client transformations, editorial shoots, or competitions participated in. Demonstrating creativity helps you stand out."
                )
            if scores.get('product_knowledge_score', 0) < 50:
                feedback.append(
                    "Product knowledge is critical. List familiarity with major brands, participation in product launches, "
                    "or experience conducting client education. Depth of product expertise can significantly impress employers."
                )
            if scores.get('creativity_score', 0) < 50:
                feedback.append(
                    "Your creativity could be more visible. Share original makeup looks, creative campaigns, or innovative client transformations. "
                    "Visual portfolios, even small ones, can showcase your artistic impact."
                )
        
        elif self.industry == 'hospitality_food':
            if scores.get('food_safety_score', 0) < 60:
                feedback.append(
                    "Food safety experience should be more prominent. Mention certifications like ServSafe, "
                    "successful inspections, or personal commitment to sanitation protocols. Health compliance is essential in food roles."
                )
            if scores.get('pos_systems_score', 0) < 50:
                feedback.append(
                    "POS system experience could be better highlighted. Familiarity with platforms like Square, Toast, or Aloha "
                    "can be a deciding factor in hospitality hiring. Be specific about the systems you’ve operated."
                )
            if scores.get('upselling_score', 0) < 50:
                feedback.append(
                    "Your upselling success could be better demonstrated. Discuss how you increased average order value, "
                    "met promotional targets, or contributed to revenue boosts through effective sales strategies."
                )
            if scores.get('teamwork_score', 0) < 50:
                feedback.append(
                    "Teamwork examples in fast-paced hospitality settings should be stronger. Mention collaboration across shifts, "
                    "event coordination, or leadership in high-demand scenarios. Teamwork stories show adaptability."
                )
        
        elif self.industry == 'arts_education':
            if scores.get('curriculum_development_score', 0) < 60:
                feedback.append(
                    "Curriculum development experience should be more prominent. Mention any programs you designed, interdisciplinary courses created, "
                    "or improvements you led. Demonstrate how your contributions impacted student learning outcomes positively."
                )
            if scores.get('teaching_experience_score', 0) < 50:
                feedback.append(
                    "Teaching experience could be more detailed. Highlight years taught, age groups, artistic disciplines, and instructional methods. "
                    "Quantify your impact wherever possible (e.g., student competition wins, increased engagement scores)."
                )
            if scores.get('artistic_skills_score', 0) < 50:
                feedback.append(
                    "Your diverse artistic skills should be better showcased. Mention mediums you specialize in, exhibitions participated in, "
                    "or community arts initiatives. Diversity in arts education strengthens your teaching portfolio."
                )
            if scores.get('technology_integration_score', 0) < 50:
                feedback.append(
                    "Technology integration should be emphasized. Describe how you incorporated digital tools, "
                    "virtual galleries, online art classes, or edtech platforms into your curriculum delivery."
                )
        
        elif self.industry == 'it_architecture':
            if scores.get('technical_skills_score', 0) < 60:
                feedback.append(
                    "Technical skills in IT Architecture could be strengthened. Highlight expertise with cloud platforms, system integrations, "
                    "solution architecture frameworks, and key technologies like AWS, Azure, or Kubernetes. Technical certifications also help."
                )
            if scores.get('project_management_score', 0) < 50:
                feedback.append(
                    "Project management in IT delivery should be clearer. Mention timelines handled, cross-team coordination, "
                    "and success in deploying complex systems. Use metrics if possible (e.g., 'delivered project 15% under budget')."
                )
            if scores.get('team_leadership_score', 0) < 50:
                feedback.append(
                    "Team leadership examples should be highlighted. Discuss how you mentored junior architects, led design teams, "
                    "or drove cross-functional collaboration across technical and business units."
                )
            if scores.get('solution_design_score', 0) < 50:
                feedback.append(
                    "Solution design examples could be stronger. Explain how you conceptualized architectures that solved business problems, "
                    "improved scalability, or optimized performance."
                )
        
        elif self.industry == 'education_administration':
            if scores.get('leadership_score', 0) < 60:
                feedback.append(
                    "Leadership achievements could be stronger. Mention strategic initiatives you led, programs launched, "
                    "or reforms introduced. Leadership in education often involves cross-functional influence and stakeholder engagement."
                )
            if scores.get('policy_implementation_score', 0) < 50:
                feedback.append(
                    "Policy implementation work should be clearer. Describe developing school or district policies, "
                    "compliance improvements, or how you ensured regulatory adherence and measurable results."
                )
            if scores.get('budget_management_score', 0) < 50:
                feedback.append(
                    "Budget management experience needs more emphasis. Share successes in allocating resources, balancing budgets, "
                    "or leading financial planning initiatives that improved efficiency."
                )
            if scores.get('staff_development_score', 0) < 50:
                feedback.append(
                    "Staff development should be highlighted. Talk about workshops you created, mentorship programs initiated, "
                    "or teacher development strategies that boosted performance and morale."
                )
        
        elif self.industry == 'military_aviation':
            if scores.get('technical_skills_score', 0) < 60:
                feedback.append(
                    "Technical aviation skills should be emphasized more. Share your knowledge of aviation systems, avionics, flight operations, "
                    "and maintenance procedures. Certification details (e.g., FAA ratings) should be clearly mentioned."
                )
            if scores.get('leadership_score', 0) < 50:
                feedback.append(
                    "Leadership within aviation environments should be highlighted. Discuss squadron management, unit readiness leadership, "
                    "or experience supervising flight or maintenance crews under operational pressure."
                )
            if scores.get('training_development_score', 0) < 50:
                feedback.append(
                    "Training and development experience should be more detailed. Describe programs you built for technical training, "
                    "safety compliance, or leadership development within military or aviation contexts."
                )
            if scores.get('safety_compliance_score', 0) < 50:
                feedback.append(
                    "Safety compliance efforts need more visibility. Share achievements maintaining operational safety standards, "
                    "audit results, or corrective actions led during inspections."
                )
        
        elif self.industry == 'entry_level_service':
            if scores.get('customer_service_score', 0) < 60:
                feedback.append(
                    "Customer service skills should be highlighted with real examples. Mention high-volume handling, satisfaction scores, "
                    "or customer commendations. Basic service achievements set entry-level candidates apart quickly."
                )
            if scores.get('teamwork_score', 0) < 50:
                feedback.append(
                    "Teamwork experiences should be clearer. Describe situations where you worked collaboratively, "
                    "helped cover shifts, or supported team goals during high-pressure periods."
                )
            if scores.get('multitasking_score', 0) < 50:
                feedback.append(
                    "Multitasking skills should be showcased. Discuss handling multiple tasks simultaneously, "
                    "juggling customer interactions, administrative work, and operational duties."
                )
            if scores.get('technical_skills_score', 0) < 50:
                feedback.append(
                    "Basic technical skills should be strengthened. Mention POS systems, Microsoft Office tools, or ticketing systems you operated. "
                    "Technical comfort boosts employability even for service roles."
                )

        elif self.industry == 'financial_services':
            if scores.get('financial_analysis_score', 0) < 60:
                feedback.append(
                    "Financial analysis skills could be stronger. Highlight experience with forecasting, budgeting, risk assessment, "
                    "or investment strategy development. Quantifiable financial results create a strong impression."
                )
            if scores.get('client_management_score', 0) < 50:
                feedback.append(
                    "Client relationship management should be emphasized. Discuss relationship building, retention improvements, "
                    "and how you handled client portfolios or account renewals successfully."
                )
            if scores.get('regulatory_compliance_score', 0) < 50:
                feedback.append(
                    "Regulatory compliance experience should be clearer. Mention your understanding of SEC, SOX, AML, or Dodd-Frank regulations, "
                    "and share real examples of compliance project involvement."
                )
            if scores.get('portfolio_management_score', 0) < 50:
                feedback.append(
                    "Portfolio management contributions should be better detailed. Describe asset allocation strategies, risk diversification, "
                    "or portfolio growth metrics you achieved."
                )

        elif self.industry == 'entry_level_finance':
            if scores.get('financial_analysis_score', 0) < 60:
                feedback.append(
                    "Financial analysis exposure could be improved. Mention internships, university projects, or simulations "
                    "where you performed forecasting, valuation, or data modeling using Excel or similar tools."
                )
            if scores.get('academic_achievement_score', 0) < 50:
                feedback.append(
                    "Academic achievements need better emphasis. Highlight GPA (if strong), scholarships, dean’s list honors, "
                    "or finance-related coursework to build credibility for entry-level finance roles."
                )
            if scores.get('technical_skills_score', 0) < 50:
                feedback.append(
                    "Technical finance skills such as Excel modeling, Python for finance, or Bloomberg Terminal usage "
                    "should be showcased to demonstrate analytical readiness."
                )
            if scores.get('client_service_score', 0) < 50:
                feedback.append(
                    "Client service exposure could be improved. Mention internship experiences, university consulting projects, "
                    "or volunteer work that developed your client-facing skills."
                )

        elif self.industry == 'bpo_operations':
            if scores.get('operations_management_score', 0) < 60:
                feedback.append(
                    "Operations management should be emphasized more. Highlight handling KPIs, optimizing workflows, "
                    "or achieving service-level agreements (SLAs) consistently in BPO environments."
                )
            if scores.get('team_leadership_score', 0) < 50:
                feedback.append(
                    "Leadership examples managing BPO teams should be shared. Discuss scheduling, performance monitoring, "
                    "coaching underperformers, or driving team metrics."
                )
            if scores.get('performance_metrics_score', 0) < 50:
                feedback.append(
                    "Performance metrics achievements could be clearer. Talk about call quality improvements, "
                    "productivity gains, or first-call resolution rate increases you contributed to."
                )
            if scores.get('client_management_score', 0) < 50:
                feedback.append(
                    "Client management stories should be highlighted. Mention direct client communications, meeting client KPIs, "
                    "or upselling additional services within BPO operations."
                )
        
        # Strengths
        strengths = []

        # General strengths
        if scores.get('experience_quality', 0) >= 80:
            strengths.append("strong and impactful work experience")
        if scores.get('education_quality', 0) >= 80:
            strengths.append("solid educational background with good credentials")
        if scores.get('skills_relevance', 0) >= 80:
            strengths.append("highly relevant skill set for the industry")
        if scores.get('achievements_quality', 0) >= 75:
            strengths.append("impressive list of measurable achievements")
        if scores.get('structure_quality', 0) >= 80:
            strengths.append("well-organized and professional CV structure")

        # Industry-specific strengths
        if self.industry == 'finance':
            if scores.get('technical_skills_score', 0) >= 70:
                strengths.append("strong technical finance capabilities")
            if scores.get('compliance_score', 0) >= 70:
                strengths.append("good compliance and risk management knowledge")

        elif self.industry == 'social_services':
            if scores.get('case_management_score', 0) >= 70:
                strengths.append("strong case management experience")
            if scores.get('crisis_intervention_score', 0) >= 70:
                strengths.append("effective crisis intervention skills")

        elif self.industry == 'customer_service':
            if scores.get('customer_service_score', 0) >= 70:
                strengths.append("excellent customer service skills")
            if scores.get('problem_solving_score', 0) >= 65:
                strengths.append("strong problem-solving abilities")

        elif self.industry == 'natural_resources':
            if scores.get('field_experience_score', 0) >= 70:
                strengths.append("extensive field experience in natural resource projects")
            if scores.get('regulatory_knowledge_score', 0) >= 65:
                strengths.append("good knowledge of environmental regulations and compliance")
            if scores.get('technical_skills_score', 0) >= 65:
                strengths.append("strong technical skills in GIS and field technologies")

        elif self.industry == 'retail_fashion':
            if scores.get('sales_performance_score', 0) >= 70:
                strengths.append("excellent retail sales performance")
            if scores.get('team_leadership_score', 0) >= 65:
                strengths.append("good team leadership in retail environments")

        elif self.industry == 'beauty_cosmetics':
            if scores.get('artistry_skills_score', 0) >= 70:
                strengths.append("strong makeup artistry skills")
            if scores.get('product_knowledge_score', 0) >= 65:
                strengths.append("deep beauty product knowledge")

        elif self.industry == 'hospitality_food':
            if scores.get('customer_service_score', 0) >= 70:
                strengths.append("excellent customer service in hospitality")
            if scores.get('food_safety_score', 0) >= 65:
                strengths.append("good food safety and sanitation practices")

        elif self.industry == 'arts_education':
            if scores.get('teaching_experience_score', 0) >= 70:
                strengths.append("strong teaching experience")
            if scores.get('curriculum_development_score', 0) >= 65:
                strengths.append("effective curriculum development skills")

        elif self.industry == 'it_architecture':
            if scores.get('technical_skills_score', 0) >= 70:
                strengths.append("robust technical skills in IT architecture")
            if scores.get('solution_design_score', 0) >= 65:
                strengths.append("solid solution design capabilities")

        elif self.industry == 'education_administration':
            if scores.get('leadership_score', 0) >= 70:
                strengths.append("strong leadership in educational institutions")
            if scores.get('policy_implementation_score', 0) >= 65:
                strengths.append("effective policy development and implementation")

        elif self.industry == 'military_aviation':
            if scores.get('technical_skills_score', 0) >= 70:
                strengths.append("strong technical aviation skills")
            if scores.get('leadership_score', 0) >= 65:
                strengths.append("solid leadership in aviation operations")

        elif self.industry == 'entry_level_service':
            if scores.get('customer_service_score', 0) >= 70:
                strengths.append("strong customer interaction and service delivery skills")
            if scores.get('multitasking_score', 0) >= 65:
                strengths.append("excellent multitasking abilities")

        elif self.industry == 'financial_services':
            if scores.get('financial_analysis_score', 0) >= 70:
                strengths.append("strong financial analysis and investment skills")
            if scores.get('portfolio_management_score', 0) >= 65:
                strengths.append("good portfolio management capabilities")

        elif self.industry == 'entry_level_finance':
            if scores.get('financial_analysis_score', 0) >= 70:
                strengths.append("good financial analysis understanding for entry-level")
            if scores.get('academic_achievement_score', 0) >= 65:
                strengths.append("strong academic performance in finance studies")

        elif self.industry == 'bpo_operations':
            if scores.get('operations_management_score', 0) >= 70:
                strengths.append("strong operations management in BPO sector")
            if scores.get('performance_metrics_score', 0) >= 65:
                strengths.append("good performance metrics and KPI management skills")
        
        # Weaknesses
        weaknesses = []

        # General weaknesses
        if scores.get('experience_quality', 0) < 60:
            weaknesses.append("work experience section is weak and lacks quantifiable achievements")
        if scores.get('education_quality', 0) < 60:
            weaknesses.append("education details are limited or missing important information")
        if scores.get('skills_relevance', 0) < 60:
            weaknesses.append("skills section lacks relevance to the target industry")
        if scores.get('achievements_quality', 0) < 50:
            weaknesses.append("achievements are minimal and not measurable with results")
        if scores.get('structure_quality', 0) < 60:
            weaknesses.append("CV structure is poorly organized, making it hard to skim")

        # Industry-specific weaknesses
        if self.industry == 'finance':
            if scores.get('technical_skills_score', 0) < 60:
                weaknesses.append("technical finance skills like risk management and financial modeling are insufficient")
            if scores.get('compliance_score', 0) < 50:
                weaknesses.append("compliance and regulatory understanding is weak, which is critical in finance roles")

        elif self.industry == 'social_services':
            if scores.get('case_management_score', 0) < 60:
                weaknesses.append("case management experience is not clearly demonstrated")
            if scores.get('crisis_intervention_score', 0) < 50:
                weaknesses.append("crisis intervention skills are missing or underrepresented")

        elif self.industry == 'customer_service':
            if scores.get('customer_service_score', 0) < 65:
                weaknesses.append("customer service accomplishments are insufficiently detailed")
            if scores.get('problem_solving_score', 0) < 50:
                weaknesses.append("problem-solving examples are missing or vague")

        elif self.industry == 'natural_resources':
            if scores.get('field_experience_score', 0) < 60:
                weaknesses.append("field experience in natural resource projects is lacking")
            if scores.get('regulatory_knowledge_score', 0) < 50:
                weaknesses.append("regulatory and compliance knowledge is weak")
            if scores.get('technical_skills_score', 0) < 50:
                weaknesses.append("technical skills such as GIS and environmental tools are poorly represented")

        elif self.industry == 'retail_fashion':
            if scores.get('sales_performance_score', 0) < 60:
                weaknesses.append("sales performance results are weak or missing")
            if scores.get('team_leadership_score', 0) < 50:
                weaknesses.append("team leadership experience in retail settings is underdeveloped")

        elif self.industry == 'beauty_cosmetics':
            if scores.get('artistry_skills_score', 0) < 60:
                weaknesses.append("artistry skills and techniques are not showcased well")
            if scores.get('product_knowledge_score', 0) < 50:
                weaknesses.append("product knowledge about cosmetics brands is insufficient")

        elif self.industry == 'hospitality_food':
            if scores.get('food_safety_score', 0) < 60:
                weaknesses.append("food safety training and certifications are not clearly mentioned")
            if scores.get('pos_systems_score', 0) < 50:
                weaknesses.append("experience with POS systems in hospitality is limited")

        elif self.industry == 'arts_education':
            if scores.get('curriculum_development_score', 0) < 60:
                weaknesses.append("curriculum development contributions are minimal or missing")
            if scores.get('teaching_experience_score', 0) < 50:
                weaknesses.append("teaching experience across diverse age groups is poorly detailed")

        elif self.industry == 'it_architecture':
            if scores.get('technical_skills_score', 0) < 60:
                weaknesses.append("technical architecture skills and certifications are insufficient")
            if scores.get('solution_design_score', 0) < 50:
                weaknesses.append("solution design experience is missing or too general")

        elif self.industry == 'education_administration':
            if scores.get('leadership_score', 0) < 60:
                weaknesses.append("leadership achievements in education administration are lacking")
            if scores.get('policy_implementation_score', 0) < 50:
                weaknesses.append("policy implementation experience is missing or weak")

        elif self.industry == 'military_aviation':
            if scores.get('technical_skills_score', 0) < 60:
                weaknesses.append("aviation technical skills need better representation")
            if scores.get('safety_compliance_score', 0) < 50:
                weaknesses.append("safety compliance experience in aviation is underdeveloped")

        elif self.industry == 'entry_level_service':
            if scores.get('customer_service_score', 0) < 60:
                weaknesses.append("customer service abilities at the entry level are weak")
            if scores.get('multitasking_score', 0) < 50:
                weaknesses.append("multitasking skills for service roles are poorly demonstrated")

        elif self.industry == 'financial_services':
            if scores.get('financial_analysis_score', 0) < 60:
                weaknesses.append("financial analysis expertise is insufficient for financial services roles")
            if scores.get('regulatory_compliance_score', 0) < 50:
                weaknesses.append("regulatory compliance understanding is weak")

        elif self.industry == 'entry_level_finance':
            if scores.get('financial_analysis_score', 0) < 60:
                weaknesses.append("financial analysis and modeling experience is weak for entry-level finance roles")
            if scores.get('academic_achievement_score', 0) < 50:
                weaknesses.append("academic achievements related to finance are not highlighted well")

        elif self.industry == 'bpo_operations':
            if scores.get('operations_management_score', 0) < 60:
                weaknesses.append("operations management and KPI tracking experience is insufficient")
            if scores.get('performance_metrics_score', 0) < 50:
                weaknesses.append("performance metrics and improvement initiatives are poorly represented")

        return feedback if feedback else ["CV looks good overall"]