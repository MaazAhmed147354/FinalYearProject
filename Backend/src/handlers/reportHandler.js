"use strict";

require("dotenv").config();
const responseHelper = require("../utils/responseHelper");
const { Resume, Candidate, Job, User, Report, ResumeScore } = require("../models");
const { generatePDF } = require("../utils/pdfGenerator");

/**
 * Generate a candidate report
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.generateCandidateReport = async (event) => {
  try {
    console.log('Raw event body:', event.body);
    
    if (!event.body) {
      return responseHelper.validationErrorResponse({
        message: "Request body is missing"
      });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return responseHelper.validationErrorResponse({
        message: "Invalid JSON in request body",
        details: parseError.message
      });
    }

    const { resume_id, user_id } = parsedBody;
    console.log('Parsed body:', { resume_id, user_id });
   
    if (!resume_id || !user_id) {
      return responseHelper.validationErrorResponse({
        resume_id: resume_id ? undefined : "Resume ID is required",
        user_id: user_id ? undefined : "User ID is required"
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

    console.log('Resume data:', JSON.stringify(resume, null, 2));
    
    // Generate the report content based on resume data and scores
    const scores = await ResumeScore.findOne({
      where: { resume_id },
      order: [['created_at', 'DESC']]
    });

    console.log('Score data:', JSON.stringify(scores, null, 2));
    
    if (!scores) {
      console.log('No scores found for resume_id:', resume_id);
      return responseHelper.errorResponse(404, "No evaluation scores found for this resume");
    }
    
    // Generate a detailed HTML report
    const reportContent = generateHTMLReport(resume, scores);
    
    // Generate PDF from HTML content
    const pdfBuffer = await generatePDF(reportContent);
    
    // Create a report record
    const report = await Report.create({
      resume_id,
      type: resume.status === 'shortlisted' ? 'shortlisted' : 'rejected',
      content: reportContent,
      generated_by: user_id,
      sent: false
    });

    // Return PDF as base64 string
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="candidate_report_${resume_id}.pdf"`,
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };

    return response;
  } catch (error) {
    console.error("Error in generateCandidateReport:", error);
    return responseHelper.errorResponse(500, "Failed to generate candidate report", error.message);
  }
};

/**
 * Generate an HTML report for a resume
 */
function generateHTMLReport(resume, scores) {
  console.log('Generating HTML report with data:', {
    resume: JSON.stringify(resume, null, 2),
    scores: JSON.stringify(scores, null, 2)
  });

  // Add error handling and logging for candidate data
  let candidateName = 'Unknown Candidate';
  try {
    if (resume.candidate && resume.candidate.name) {
      candidateName = resume.candidate.name;
    } else if (resume.parsed_data && resume.parsed_data.candidate_name) {
      candidateName = resume.parsed_data.candidate_name;
    }
    console.log('Using candidate name:', candidateName);
  } catch (error) {
    console.error('Error getting candidate name:', error);
  }

  const job = resume.job;
  
  // Format score data with safe defaults and debug logging
  console.log('Raw score values:', {
    total_score: scores.total_score,
    skills_score: scores.skills_score,
    experience_score: scores.experience_score,
    keyword_score: scores.keyword_score
  });

  const totalScore = scores ? parseFloat(scores.total_score || 0) : 0;
  const skillsScore = scores ? parseFloat(scores.skills_score || 0) : 0;
  const experienceScore = scores ? parseFloat(scores.experience_score || 0) : 0;
  const keywordScore = scores ? parseFloat(scores.keyword_score || 0) : 0;

  console.log('Parsed score values:', {
    totalScore,
    skillsScore,
    experienceScore,
    keywordScore
  });
  
  // Get arrays directly from the model's getters
  let matchingSkills = scores.matching_skills || [];
  let missingSkills = scores.missing_skills || [];
  let strengths = scores.strengths || [];
  let improvements = scores.improvements || [];

  // Ensure arrays
  matchingSkills = Array.isArray(matchingSkills) ? matchingSkills : [];
  missingSkills = Array.isArray(missingSkills) ? missingSkills : [];
  strengths = Array.isArray(strengths) ? strengths : [];
  improvements = Array.isArray(improvements) ? improvements : [];

  console.log('Final arrays:', {
    matchingSkills,
    missingSkills,
    strengths,
    improvements
  });
  
  // If no strengths provided, generate from matching skills
  if (strengths.length === 0 && matchingSkills.length > 0) {
    strengths = [
      ...matchingSkills.slice(0, 3).map(skill => `Strong proficiency in ${skill}`),
      ...(resume.experience_years > 3 ? ['Substantial industry experience'] : [])
    ];
    console.log('Generated strengths:', strengths);
  }

  // If no improvements provided, generate from missing skills
  if (improvements.length === 0 && missingSkills.length > 0) {
    improvements = missingSkills.slice(0, 3).map(skill => `Develop expertise in ${skill}`);
    console.log('Generated improvements:', improvements);
  }
  
  // Determine recommendation based on score
  let recommendation;
  if (totalScore >= 75) {
    recommendation = "This candidate is an excellent match for the position. Recommend proceeding to the next stage of the interview process.";
  } else if (totalScore >= 60) {
    recommendation = "This candidate is a good match for the position. Consider for further evaluation.";
  } else if (totalScore >= 50) {
    recommendation = "This candidate shows potential but may need additional evaluation before proceeding.";
  } else {
    recommendation = "This candidate is not a strong match for this specific position. Consider for other opportunities that better align with their skills.";
  }

  console.log('Final recommendation:', recommendation);
  
  // Generate the HTML content
  const htmlContent = `
      <h2>Candidate Evaluation Report</h2>
      <h3>Overview</h3>
      <p><strong>Candidate:</strong> ${candidateName}</p>
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
      <p>Based on the resume analysis, ${candidateName} demonstrates strengths in the following areas:</p>
      <ul>
        ${strengths.map(strength => `<li>${strength}</li>`).join('')}
      </ul>
      
      <h3>Areas for Improvement</h3>
      <p>To better align with ${job ? job.title : 'the position'}, the candidate could improve in these areas:</p>
      <ul>
        ${improvements.map(improvement => `<li>${improvement}</li>`).join('')}
      </ul>
      
      <h3>Recommendation</h3>
      <p>${recommendation}</p>
    `;

  console.log('Generated HTML content:', htmlContent);
  return htmlContent;
}

/**
 * Compare candidates
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.compareCandidates = async (event) => {
  try {
    const { resume_ids } = JSON.parse(event.body);
    
    if (!resume_ids) {
      return responseHelper.validationErrorResponse({
        resume_ids: "Resume IDs are required"
      });
    }
    
    // Rest of the function implementation...
    return responseHelper.successResponse(200, "Candidates compared successfully", {});
  } catch (error) {
    console.error("Error in compareCandidates:", error);
    return responseHelper.errorResponse(500, "Failed to compare candidates", error.message);
  }
};

/**
 * Get reports for a resume
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.getReportsForResume = async (event) => {
  try {
    const { resume_id } = event.pathParameters;
    
    if (!resume_id) {
      return responseHelper.validationErrorResponse({
        resume_id: "Resume ID is required"
      });
    }
    
    // Rest of the function implementation...
    return responseHelper.successResponse(200, "Reports retrieved successfully", {});
  } catch (error) {
    console.error("Error in getReportsForResume:", error);
    return responseHelper.errorResponse(500, "Failed to retrieve reports", error.message);
  }
};

/**
 * Get a specific report
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.getReport = async (event) => {
  try {
    const { report_id } = event.pathParameters;
    
    if (!report_id) {
      return responseHelper.validationErrorResponse({
        report_id: "Report ID is required"
      });
    }
    
    // Rest of the function implementation...
    return responseHelper.successResponse(200, "Report retrieved successfully", {});
  } catch (error) {
    console.error("Error in getReport:", error);
    return responseHelper.errorResponse(500, "Failed to retrieve report", error.message);
  }
};

/**
 * Mark a report as sent
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.markReportAsSent = async (event) => {
  try {
    const { report_id } = JSON.parse(event.body);
    
    if (!report_id) {
      return responseHelper.validationErrorResponse({
        report_id: "Report ID is required"
      });
    }
    
    // Rest of the function implementation...
    return responseHelper.successResponse(200, "Report marked as sent successfully", {});
  } catch (error) {
    console.error("Error in markReportAsSent:", error);
    return responseHelper.errorResponse(500, "Failed to mark report as sent", error.message);
  }
};