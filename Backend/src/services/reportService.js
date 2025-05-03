"use strict";

const { Report, Resume, ResumeScore, Candidate, Job, User } = require('../models');
const { Op } = require('sequelize');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Generate a detailed report for a candidate's resume
 * @param {number} resumeId - Resume ID
 * @param {number} userId - User ID of the generator
 * @returns {Promise<Object>} Generated report
 */
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

    // Generate report content using Python model
    const reportContent = await generateReportContent(resume);

    // Create report record
    const report = await Report.create({
      resume_id: resumeId,
      type: resume.status === 'shortlisted' ? 'shortlisted' : 'rejected',
      content: reportContent,
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

    return completeReport;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate report content using Python model
 * @param {Object} resume - Resume with related data
 * @returns {Promise<string>} Generated report content
 */
const generateReportContent = async (resume) => {
  try {
    // Try to get existing score data
    let scoreData = null;
    if (resume.scores && resume.scores.length > 0) {
      scoreData = resume.scores[0];
    }

    // If no score data exists, use Python model to generate a basic report
    if (!scoreData) {
      return await generateBasicReport(resume);
    }

    // Build comprehensive report based on score data
    const candidateName = resume.candidate.name;
    const jobTitle = resume.job ? resume.job.title : 'the position';
    
    let reportContent = `
      <h2>Candidate Evaluation Report</h2>
      <h3>Overview</h3>
      <p><strong>Candidate:</strong> ${candidateName}</p>
      <p><strong>Position:</strong> ${jobTitle}</p>
      <p><strong>Overall Match Score:</strong> ${scoreData.total_score}%</p>
      
      <h3>Score Breakdown</h3>
      <ul>
        <li><strong>Skills Match:</strong> ${scoreData.skills_score}%</li>
        <li><strong>Experience Match:</strong> ${scoreData.experience_score}%</li>
        <li><strong>Keyword Match:</strong> ${scoreData.keyword_score}%</li>
      </ul>
      
      <h3>Matching Skills</h3>
      <ul>
        ${(scoreData.matching_skills || []).map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Missing Skills</h3>
      <ul>
        ${(scoreData.missing_skills || []).map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Candidate Strengths</h3>
      <p>Based on the resume analysis, ${candidateName} demonstrates strengths in the following areas:</p>
      <ul>
        ${(scoreData.matching_skills || []).slice(0, 3).map(skill => `<li>${skill}</li>`).join('')}
        ${resume.experience_years > 3 ? '<li>Substantial industry experience</li>' : ''}
      </ul>
      
      <h3>Areas for Improvement</h3>
      <p>To better align with ${jobTitle}, the candidate could improve in these areas:</p>
      <ul>
        ${(scoreData.missing_skills || []).slice(0, 3).map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Recommendation</h3>
      <p>${getRecommendation(scoreData.total_score)}</p>
    `;
    
    return reportContent;
  } catch (error) {
    console.error('Error generating report content:', error);
    return `<h2>Basic Candidate Report</h2><p>Error generating detailed report: ${error.message}</p>`;
  }
};

/**
 * Generate a basic report without score data
 * @param {Object} resume - Resume with related data
 * @returns {Promise<string>} Basic report content
 */
const generateBasicReport = async (resume) => {
  try {
    // Use Python model to generate a basic evaluation
    const pythonScript = path.join(__dirname, '../../models/generate_report.py');
    
    const resumeData = JSON.stringify({
      candidate_name: resume.candidate.name,
      job_title: resume.job ? resume.job.title : 'the position',
      experience_years: resume.experience_years || 0,
      skills: resume.skills || [],
      education: resume.education || [],
      parsed_data: resume.parsed_data || {}
    });
    
    // Execute Python script
    const result = await new Promise((resolve, reject) => {
      const python = spawn(process.env.PYTHON_PATH || 'python3', [
        pythonScript,
        '--resume', resumeData
      ]);
      
      let dataString = '';
      
      // Collect data from script
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      // Handle error
      python.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
        reject(new Error(`Error generating report: ${data}`));
      });
      
      // Handle script completion
      python.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}`));
        }
        
        try {
          resolve(dataString);
        } catch (error) {
          reject(new Error(`Error parsing report output: ${error.message}`));
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error generating basic report:', error);
    
    // Fallback to a very basic report template
    const candidateName = resume.candidate.name;
    const jobTitle = resume.job ? resume.job.title : 'the position';
    
    return `
      <h2>Basic Candidate Report</h2>
      <p><strong>Candidate:</strong> ${candidateName}</p>
      <p><strong>Position:</strong> ${jobTitle}</p>
      <p><strong>Experience:</strong> ${resume.experience_years || 0} years</p>
      <p><strong>Skills:</strong> ${(resume.skills || []).join(', ')}</p>
      <p><strong>Education:</strong> ${formatEducation(resume.education || [])}</p>
      <p>This is an automatically generated basic report as detailed analysis is not available.</p>
    `;
  }
};

/**
 * Format education for display
 * @param {Array} education - Education entries
 * @returns {string} Formatted education string
 */
const formatEducation = (education) => {
  if (!education || education.length === 0) {
    return 'Not specified';
  }
  
  return education.map(edu => {
    const degree = edu.degree || '';
    const institution = edu.institution || '';
    return `${degree} from ${institution}`;
  }).join('; ');
};

/**
 * Get recommendation based on score
 * @param {number} score - Total match score
 * @returns {string} Recommendation text
 */
const getRecommendation = (score) => {
  if (score >= 85) {
    return 'This candidate is an excellent match for the position. Recommend proceeding to the next stage of the interview process.';
  } else if (score >= 70) {
    return 'This candidate is a good match for the position. Consider for further evaluation.';
  } else if (score >= 50) {
    return 'This candidate meets some of the requirements. May require additional screening or skills development.';
  } else {
    return 'This candidate is not a strong match for this specific position. Consider for other opportunities that better align with their skills.';
  }
};

/**
 * Compare multiple candidates
 * @param {string} resumeIds - Comma-separated resume IDs
 * @returns {Promise<Object>} Comparison results
 */
exports.compareCandidates = async (resumeIds) => {
  try {
    // Parse resume IDs
    const ids = resumeIds.split(',').map(id => parseInt(id, 10));
    
    if (ids.length < 2) {
      throw new Error('At least two candidates are required for comparison');
    }
    
    // Get resumes with scores
    const resumes = await Resume.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
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
  } catch (error) {
    throw error;
  }
};

/**
 * Get reports for a resume
 * @param {number} resumeId - Resume ID
 * @returns {Promise<Array>} List of reports
 */
exports.getReportsForResume = async (resumeId) => {
  try {
    const reports = await Report.findAll({
      where: { resume_id: resumeId },
      include: [
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return reports;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific report
 * @param {number} reportId - Report ID
 * @returns {Promise<Object>} Report details
 */
exports.getReport = async (reportId) => {
  try {
    const report = await Report.findByPk(reportId, {
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
      throw new Error('Report not found');
    }
    
    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark a report as sent
 * @param {number} reportId - Report ID
 * @returns {Promise<Object>} Updated report
 */
exports.markReportAsSent = async (reportId) => {
  try {
    const report = await Report.findByPk(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    await report.update({ sent: true });
    
    return report;
  } catch (error) {
    throw error;
  }
};
