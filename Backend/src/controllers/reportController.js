"use strict";

const responseHelper = require("../utils/responseHelper");
const { Resume, Candidate, Job, User, Report, ResumeScore } = require("../models");

/**
 * Generate a detailed report for a candidate
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.generateCandidateReport = async (event) => {
  try {
    const { resume_id, user_id } = JSON.parse(event.body);
   
    if (!resume_id || !user_id) {
      return responseHelper.validationErrorResponse({
        resume_id: "Resume ID is required",
        user_id: "User ID is required"
      });
    }
    
    const resume = await Resume.findByPk(resume_id, {
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
    });
    
    if (!resume) {
      return responseHelper.notFoundResponse('Resume');
    }
    
    // Generate the report content based on resume data and scores
    const scores = await ResumeScore.findOne({
      where: { resume_id },
      order: [['created_at', 'DESC']]
    });
    
    // Generate a detailed HTML report
    const reportContent = generateHTMLReport(resume, scores);
    
    // Create a report record
    const report = await Report.create({
      resume_id,
      type: resume.status === 'shortlisted' ? 'shortlisted' : 'rejected',
      content: reportContent,
      generated_by: user_id,
      sent: false
    });
    
    // Get the full report with associations
    const fullReport = await Report.findByPk(report.id, {
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
    
    return responseHelper.successResponse(201, "Candidate report generated successfully", fullReport);
  } catch (error) {
    console.error("Error in generateCandidateReport:", error);
    return responseHelper.errorResponse(500, "Failed to generate candidate report", error.message);
  }
};

/**
 * Compare multiple candidates side-by-side
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.compareCandidates = async (event) => {
  try {
    const { resume_ids } = JSON.parse(event.body);
   
    if (!resume_ids) {
      return responseHelper.validationErrorResponse({
        resume_ids: "Resume IDs are required"
      });
    }
    
    const comparison = await compareResumes(resume_ids);
    return responseHelper.successResponse(200, "Candidates compared successfully", comparison);
  } catch (error) {
    console.error("Error in compareCandidates:", error);
   
    if (error.message === 'At least two candidates are required for comparison') {
      return responseHelper.validationErrorResponse({
        resume_ids: error.message
      });
    }
   
    if (error.message.includes('not found')) {
      return responseHelper.notFoundResponse(error.message);
    }
   
    return responseHelper.errorResponse(500, "Failed to compare candidates", error.message);
  }
};

/**
 * Get all reports for a specific resume
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.getReportsForResume = async (event) => {
  try {
    const { resume_id } = event.pathParameters;
   
    if (!resume_id) {
      return responseHelper.validationErrorResponse({
        resume_id: "Resume ID is required"
      });
    }
    
    const reports = await Report.findAll({
      where: { resume_id },
      include: [
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return responseHelper.successResponse(200, "Reports retrieved successfully", reports);
  } catch (error) {
    console.error("Error in getReportsForResume:", error);
    return responseHelper.errorResponse(500, "Failed to retrieve reports", error.message);
  }
};

/**
 * Get a specific report by ID
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.getReport = async (event) => {
  try {
    const { report_id } = event.pathParameters;
   
    if (!report_id) {
      return responseHelper.validationErrorResponse({
        report_id: "Report ID is required"
      });
    }
    
    const report = await Report.findByPk(report_id, {
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
    
    if (!report) {
      return responseHelper.notFoundResponse('Report');
    }
    
    return responseHelper.successResponse(200, "Report retrieved successfully", report);
  } catch (error) {
    console.error("Error in getReport:", error);
    return responseHelper.errorResponse(500, "Failed to retrieve report", error.message);
  }
};

/**
 * Mark a report as sent
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.markReportAsSent = async (event) => {
  try {
    const { report_id } = JSON.parse(event.body);
   
    if (!report_id) {
      return responseHelper.validationErrorResponse({
        report_id: "Report ID is required"
      });
    }
    
    const report = await Report.findByPk(report_id);
    
    if (!report) {
      return responseHelper.notFoundResponse('Report');
    }
    
    await report.update({ sent: true });
    
    return responseHelper.successResponse(200, "Report marked as sent successfully", report);
  } catch (error) {
    console.error("Error in markReportAsSent:", error);
    return responseHelper.errorResponse(500, "Failed to mark report as sent", error.message);
  }
};

/**
 * Generate an HTML report for a resume
 */
function generateHTMLReport(resume, scores) {
  const candidate = resume.candidate;
  const job = resume.job;
  
  // Format score data
  const totalScore = scores ? scores.total_score : 0;
  const skillsScore = scores ? scores.skills_score : 0;
  const experienceScore = scores ? scores.experience_score : 0;
  const keywordScore = scores ? scores.keyword_score : 0;
  const matchingSkills = scores ? (scores.matching_skills || []) : [];
  const missingSkills = scores ? (scores.missing_skills || []) : [];
  
  // Determine recommendation based on score
  let recommendation;
  if (totalScore >= 75) {
    recommendation = "This candidate is an excellent match for the position. Recommend proceeding to the next stage of the interview process.";
  } else if (totalScore >= 60) {
    recommendation = "This candidate is a good match for the position. Consider for further evaluation.";
  } else if (totalScore >= 50) {
    recommendation = "This candidate meets some of the requirements. May require additional screening or skills development.";
  } else {
    recommendation = "This candidate is not a strong match for this specific position. Consider for other opportunities that better align with their skills.";
  }
  
  // Generate the HTML content
  return `
      <h2>Candidate Evaluation Report</h2>
      <h3>Overview</h3>
      <p><strong>Candidate:</strong> ${candidate.name}</p>
      <p><strong>Position:</strong> ${job ? job.title : 'Not specified'}</p>
      <p><strong>Overall Match Score:</strong> ${totalScore.toFixed(2)}%</p>
      
      <h3>Score Breakdown</h3>
      <ul>
        <li><strong>Skills Match:</strong> ${skillsScore.toFixed(2)}%</li>
        <li><strong>Experience Match:</strong> ${experienceScore.toFixed(2)}%</li>
        <li><strong>Keyword Match:</strong> ${keywordScore.toFixed(2)}%</li>
      </ul>
      
      <h3>Matching Skills</h3>
      <ul>
        ${matchingSkills.map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Missing Skills</h3>
      <ul>
        ${missingSkills.map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Candidate Strengths</h3>
      <p>Based on the resume analysis, ${candidate.name} demonstrates strengths in the following areas:</p>
      <ul>
        ${matchingSkills.slice(0, 3).map(skill => `<li>${skill}</li>`).join('')}
        ${resume.experience_years > 3 ? '<li>Substantial industry experience</li>' : ''}
      </ul>
      
      <h3>Areas for Improvement</h3>
      <p>To better align with ${job ? job.title : 'the position'}, the candidate could improve in these areas:</p>
      <ul>
        ${missingSkills.slice(0, 3).map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Recommendation</h3>
      <p>${recommendation}</p>
    `;
}

/**
 * Compare multiple resumes
 */
async function compareResumes(resumeIds) {
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
}