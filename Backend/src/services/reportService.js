// Modify this function in reportService.js to return structured JSON instead of HTML

const { Resume, Candidate, Job, User, Report, ResumeScore, CriteriaSet } = require("../models");

exports.generateCandidateReport = async (resumeId, userId) => {
  try {
    // Get resume with related data
    const resume = await Resume.findByPk(resumeId, {
      include: [
        {
          model: Candidate,
          as: 'candidate'
        },
        {
          model: Job,
          as: 'job'
        },
        {
          model: ResumeScore,
          as: 'scores'
        }
      ]
    });
    
    if (!resume) {
      throw new Error('Resume not found');
    }
    
    // Generate report content using data model
    const reportContent = await generateReportContent(resume);
    
    // Create report record - store the JSON as a string
    const report = await Report.create({
      resume_id: resumeId,
      type: resume.status === 'shortlisted' ? 'shortlisted' : 'rejected',
      content: JSON.stringify(reportContent),
      generated_by: userId,
      sent: false
    });
    
    // Get complete report with related data
    const completeReport = await Report.findByPk(report.id, {
      include: [
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            },
            {
              model: Job,
              as: 'job'
            }
          ]
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    // Parse the JSON string back to an object before returning
    const reportWithParsedContent = {
      ...completeReport.toJSON(),
      content: reportContent
    };
    
    return reportWithParsedContent;
  } catch (error) {
    throw error;
  }
};

/**
 * Compare multiple candidates
 */
exports.compareResumes = async (resumeIds) => {
  // Parse resume IDs
  const ids = Array.isArray(resumeIds) ? resumeIds : resumeIds.split(',').map(id => parseInt(id, 10));
 
  if (ids.length < 2) {
    throw new Error('At least two candidates are required for comparison');
  }
 
  // Get resumes with scores
  const resumes = await Resume.findAll({
    where: {
      id: ids
    },
    include: [
      {
        model: Candidate,
        as: 'candidate'
      },
      {
        model: Job,
        as: 'job'
      },
      {
        model: ResumeScore,
        as: 'scores'
      }
    ]
  });
 
  if (resumes.length !== ids.length) {
    throw new Error('Some resumes not found');
  }
 
  // Check if all resumes are for the same job
  const jobIds = new Set(resumes.map(r => r.job_id));
  const sameJob = jobIds.size === 1 && !jobIds.has(null);
 
  // Build comparison data
  const comparison = {
    job: sameJob ? resumes[0].job : null,
    candidates: resumes.map(resume => {
      const score = resume.scores && resume.scores.length > 0 ? resume.scores[0] : null;
     
      return {
        id: resume.id,
        candidate_id: resume.candidate_id,
        candidate_name: resume.candidate.name,
        candidate_email: resume.candidate.email,
        experience_years: resume.experience_years || 0,
        skills: resume.skills || [],
        education: resume.education || [],
        total_score: score ? score.total_score : null,
        skills_score: score ? score.skills_score : null,
        experience_score: score ? score.experience_score : null,
        keyword_score: score ? score.keyword_score : null,
        matching_skills: score ? score.matching_skills : [],
        missing_skills: score ? score.missing_skills : []
      };
    })
  };
 
  // Sort candidates by total score if available
  comparison.candidates.sort((a, b) => {
    if (a.total_score === null && b.total_score === null) return 0;
    if (a.total_score === null) return 1;
    if (b.total_score === null) return -1;
    return b.total_score - a.total_score;
  });
 
  return comparison;
};

// Generate structured JSON report data instead of HTML
const generateReportContent = async (resume) => {
  try {
    // Try to get existing score data
    let scoreData = null;
    if (resume.scores && resume.scores.length > 0) {
      scoreData = resume.scores[0];
    }
    
    // If no score data exists, use basic report format
    if (!scoreData) {
      return await generateBasicReport(resume);
    }
    
    // Build structured report based on score data
    const candidateName = resume.candidate.name;
    const jobTitle = resume.job ? resume.job.title : 'the position';
    
    // Parse JSON fields
    let matchingSkills = [];
    let missingSkills = [];
    let strengths = [];
    let improvements = [];

    try {
      matchingSkills = JSON.parse(scoreData.matching_skills || '[]');
      missingSkills = JSON.parse(scoreData.missing_skills || '[]');
      strengths = JSON.parse(scoreData.strengths || '[]');
      improvements = JSON.parse(scoreData.improvements || '[]');
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      // Use empty arrays as fallback
      matchingSkills = [];
      missingSkills = [];
      strengths = [];
      improvements = [];
    }

    // Ensure all scores are numbers
    const scores = {
      total: parseFloat(scoreData.total_score || 0),
      skills: parseFloat(scoreData.skills_score || 0),
      experience: parseFloat(scoreData.experience_score || 0),
      keyword: parseFloat(scoreData.keyword_score || 0)
    };
    
    // Get criteria for required experience if available
    let requiredExperience = 0;
    if (resume.job) {
      const criteria = await CriteriaSet.findOne({
        where: { job_id: resume.job.id }
      });
      
      if (criteria) {
        requiredExperience = criteria.min_experience_years || 0;
      }
    }
    
    // Format skills for the report modal
    const formattedSkills = [
      ...matchingSkills.map(skill => ({ name: skill, match: true })),
      ...missingSkills.map(skill => ({ name: skill, match: false }))
    ];
    
    // Build the report data structure
    const reportData = {
      matchScore: Math.round(scores.total),
      skills: formattedSkills,
      requiredExperience: requiredExperience,
      candidateExperience: resume.experience_years || 0,
      experienceScore: Math.round(scores.experience),
      improvements: improvements,
      recommendation: getRecommendation(scores.total)
    };
    
    return reportData;
  } catch (error) {
    console.error('Error generating report content:', error);
    return await generateBasicReport(resume);
  }
};

// Also fix the getRecommendation function to handle non-number inputs
const getRecommendation = (score) => {
  // Ensure score is a number
  const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  
  if (numScore >= 85) {
    return 'This candidate is an excellent match for the position. Recommend proceeding to the next stage of the interview process.';
  } else if (numScore >= 70) {
    return 'This candidate is a good match for the position. Consider for further evaluation.';
  } else if (numScore >= 50) {
    return 'This candidate meets some of the requirements. May require additional screening or skills development.';
  } else {
    return 'This candidate is not a strong match for this specific position. Consider for other opportunities that better align with their skills.';
  }
};

// Generate basic report in structured JSON format
const generateBasicReport = async (resume) => {
  try {
    const candidateName = resume.candidate.name;
    const jobTitle = resume.job ? resume.job.title : 'the position';
    
    // Parse skills array
    let skills = [];
    try {
      skills = Array.isArray(resume.skills) ? resume.skills : JSON.parse(resume.skills || '[]');
    } catch (error) {
      console.error('Error parsing skills:', error);
      skills = [];
    }
    
    // Format skills for the report modal
    const formattedSkills = skills.map(skill => ({
      name: skill,
      match: true // Assume all skills match in the basic report
    }));
    
    // Create default improvements list
    const improvements = [
      "This is a basic report without detailed analysis",
      "Consider evaluating against specific job criteria"
    ];
    
    // Build the report data structure
    return {
      matchScore: 50, // Default score for basic report
      skills: formattedSkills,
      requiredExperience: 0,
      candidateExperience: resume.experience_years || 0,
      experienceScore: 50, // Default experience score
      improvements: improvements,
      recommendation: "This is a basic report as detailed analysis is not available."
    };
  } catch (error) {
    console.error('Error generating basic report:', error);
    return {
      matchScore: 0,
      skills: [],
      requiredExperience: 0,
      candidateExperience: 0,
      experienceScore: 0,
      improvements: ["Error generating report: " + error.message],
      recommendation: "An error occurred during report generation."
    };
  }
};