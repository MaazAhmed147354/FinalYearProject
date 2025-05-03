"use strict";

const { Resume, Candidate, Job, ResumeScore, CriteriaSet } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Convert fs functions to promise-based
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

/**
 * Upload and process a resume
 * @param {Object} resumeData - Resume metadata
 * @param {Object} file - Uploaded file
 * @returns {Promise<Object>} Processed resume data
 */
exports.uploadResume = async (resumeData, file) => {
  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileName = `${uuidv4()}_${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const fileBuffer = file.buffer || Buffer.from(file.data, 'base64');
    await writeFile(filePath, fileBuffer);

    // Check if candidate already exists
    let candidate = await Candidate.findOne({
      where: { email: resumeData.candidate_email }
    });

    // Create candidate if not exists
    if (!candidate) {
      candidate = await Candidate.create({
        name: resumeData.candidate_name,
        email: resumeData.candidate_email,
        phone: resumeData.candidate_phone || null,
        location: resumeData.candidate_location || null,
        source_email_id: resumeData.source_email_id || null
      });
    }

    // Parse resume using Python script
    const parsedData = await parseResume(filePath);

    // Create resume record
    const resume = await Resume.create({
      candidate_id: candidate.id,
      job_id: resumeData.job_id || null,
      file_path: filePath,
      parsed_data: parsedData,
      experience_years: parsedData.total_experience_years || 0,
      skills: parsedData.skills || [],
      education: parsedData.education || [],
      status: 'pending'
    });

    // Score the resume if job_id is provided
    if (resumeData.job_id) {
      await scoreResume(resume.id, resumeData.job_id);
    }

    return {
      id: resume.id,
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      job_id: resume.job_id,
      status: resume.status,
      parsed_data: parsedData,
      created_at: resume.created_at
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Parse resume file using Python parser
 * @param {string} filePath - Path to resume file
 * @returns {Promise<Object>} Parsed resume data
 */
const parseResume = async (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../models/parse_resume.py');
    const python = spawn(process.env.PYTHON_PATH || 'python3', [pythonScript, filePath]);
    
    let dataString = '';
    
    // Collect data from script
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Handle error
    python.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
      reject(new Error(`Error parsing resume: ${data}`));
    });
    
    // Handle script completion
    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}`));
      }
      
      try {
        const parsedData = JSON.parse(dataString);
        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Error parsing JSON output: ${error.message}`));
      }
    });
  });
};

/**
 * Score a resume against job criteria
 * @param {number} resumeId - Resume ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Resume score
 */
const scoreResume = async (resumeId, jobId) => {
  try {
    // Get resume and criteria
    const resume = await Resume.findByPk(resumeId);
    const criteria = await CriteriaSet.findOne({
      where: { job_id: jobId }
    });

    if (!resume || !criteria) {
      throw new Error('Resume or criteria not found');
    }

    // Use Python model to evaluate resume
    const scoreData = await evaluateResume(resume, criteria);

    // Create score record
    const score = await ResumeScore.create({
      resume_id: resumeId,
      criteria_id: criteria.id,
      total_score: scoreData.score,
      skills_score: scoreData.skillsScore,
      experience_score: scoreData.experienceScore,
      keyword_score: scoreData.keywordScore,
      missing_skills: scoreData.missingSkills,
      matching_skills: scoreData.matchingSkills
    });

    return score;
  } catch (error) {
    console.error(`Error scoring resume: ${error.message}`);
    // Continue without scoring if error occurs
    return null;
  }
};

/**
 * Evaluate resume using Python model
 * @param {Object} resume - Resume data
 * @param {Object} criteria - Criteria data
 * @returns {Promise<Object>} Evaluation results
 */
const evaluateResume = async (resume, criteria) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../models/evaluate_resume.py');
    const resumeData = JSON.stringify(resume.parsed_data || {});
    const criteriaData = JSON.stringify({
      required_skills: criteria.required_skills || [],
      min_experience_years: criteria.min_experience_years || 0,
      industry: criteria.industry || 'general'
    });
    
    const python = spawn(process.env.PYTHON_PATH || 'python3', [
      pythonScript,
      '--resume', resumeData,
      '--criteria', criteriaData
    ]);
    
    let dataString = '';
    
    // Collect data from script
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Handle error
    python.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
      reject(new Error(`Error evaluating resume: ${data}`));
    });
    
    // Handle script completion
    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}`));
      }
      
      try {
        const evaluationData = JSON.parse(dataString);
        resolve({
          score: evaluationData.total_score || 0,
          skillsScore: evaluationData.skills_score || 0,
          experienceScore: evaluationData.experience_score || 0,
          keywordScore: evaluationData.keyword_score || 0,
          missingSkills: evaluationData.missing_skills || [],
          matchingSkills: evaluationData.matching_skills || []
        });
      } catch (error) {
        reject(new Error(`Error parsing JSON output: ${error.message}`));
      }
    });
  });
};

/**
 * List resumes with optional filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of resumes
 */
exports.listResumes = async (filters = {}) => {
  try {
    // Build where clause from filters
    const whereClause = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.job_id) {
      whereClause.job_id = filters.job_id;
    }
    
    // Get resumes with candidate and job information
    const resumes = await Resume.findAll({
      where: whereClause,
      include: [
        {
          model: Candidate,
          as: 'candidate',
          attributes: ['id', 'name', 'email', 'phone', 'location']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'department', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return resumes;
  } catch (error) {
    throw error;
  }
};

/**
 * Get resume details by ID
 * @param {number} id - Resume ID
 * @returns {Promise<Object>} Resume details
 */
exports.getResumeDetails = async (id) => {
  try {
    const resume = await Resume.findByPk(id, {
      include: [
        {
          model: Candidate,
          as: 'candidate',
          attributes: ['id', 'name', 'email', 'phone', 'location']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'department', 'status']
        }
      ]
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Get scores if available
    const scores = await ResumeScore.findAll({
      where: { resume_id: id },
      include: [
        {
          model: CriteriaSet,
          as: 'criteria',
          attributes: ['id', 'name', 'job_id']
        }
      ]
    });

    return {
      ...resume.toJSON(),
      scores: scores || []
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update resume status
 * @param {number} id - Resume ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated resume
 */
exports.updateResumeStatus = async (id, status) => {
  try {
    const resume = await Resume.findByPk(id);

    if (!resume) {
      throw new Error('Resume not found');
    }

    if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
      throw new Error('Invalid status. Must be pending, shortlisted, or rejected');
    }

    await resume.update({ status });
    return resume;
  } catch (error) {
    throw error;
  }
};

/**
 * Associate resume with job
 * @param {number} id - Resume ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Updated resume
 */
exports.associateResumeWithJob = async (id, jobId) => {
  try {
    const resume = await Resume.findByPk(id);
    const job = await Job.findByPk(jobId);

    if (!resume) {
      throw new Error('Resume not found');
    }

    if (!job) {
      throw new Error('Job not found');
    }

    await resume.update({ job_id: jobId });
    
    // Score the resume against the new job
    await scoreResume(id, jobId);
    
    return resume;
  } catch (error) {
    throw error;
  }
};

/**
 * Get resumes by candidate ID
 * @param {number} candidateId - Candidate ID
 * @returns {Promise<Array>} List of resumes
 */
exports.getResumesByCandidate = async (candidateId) => {
  try {
    const resumes = await Resume.findAll({
      where: { candidate_id: candidateId },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'department', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return resumes;
  } catch (error) {
    throw error;
  }
};

/**
 * Get top scored resumes for a job
 * @param {number} jobId - Job ID
 * @param {number} limit - Number of resumes to return
 * @returns {Promise<Array>} List of top scored resumes
 */
exports.getTopScoredResumesForJob = async (jobId, limit = 10) => {
  try {
    // Get all resumes for this job with their highest score
    const resumes = await Resume.findAll({
      where: { job_id: jobId },
      include: [
        {
          model: Candidate,
          as: 'candidate',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ResumeScore,
          as: 'scores',
          where: {
            [Op.and]: [
              { '$CriteriaSet.job_id$': jobId }
            ]
          },
          include: [
            {
              model: CriteriaSet,
              as: 'criteria'
            }
          ]
        }
      ],
      order: [[{ model: ResumeScore, as: 'scores' }, 'total_score', 'DESC']],
      limit
    });

    return resumes;
  } catch (error) {
    throw error;
  }
};
