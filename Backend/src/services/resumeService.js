"use strict";

const {
  Resume,
  Candidate,
  Job,
  ResumeScore,
  CriteriaSet,
  CriteriaSkill,
  CriteriaKeyword,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Convert fs functions to promise-based
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Configure Python API endpoint
const PYTHON_API_BASE_URL =
  process.env.PYTHON_API_URL || "http://localhost:3001/dev";

/**
 * Upload and process a resume
 * @param {Object} resumeData - Resume metadata
 * @param {Object} file - Uploaded file
 * @returns {Promise<Object>} Processed resume data
 */
exports.uploadResume = async (resumeData, file) => {
  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../../uploads/resumes");
    await mkdir(uploadDir, { recursive: true });
    // Generate unique filename
    const fileName =
      `${uuidv4()}_${file.originalname.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);
    // Save file
    const fileBuffer = file.buffer || Buffer.from(file.data,
      "base64");
    await writeFile(filePath, fileBuffer);
    // Check if candidate already exists
    let candidate = await Candidate.findOne({
      where: { email: resumeData.candidate_email },
    });
    // Create candidate if not exists
    if (!candidate) {
      candidate = await Candidate.create({
        name: resumeData.candidate_name,
        email: resumeData.candidate_email,
        phone: resumeData.candidate_phone || null,
        location: resumeData.candidate_location || null,
        source_email_id: resumeData.source_email_id || null,
      });
    }
    // Parse resume using Python API
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
      status: "pending",
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
      created_at: resume.created_at,
    };
  } catch (error) {
    console.error("Error in uploadResume:", error);
    throw error;
  }
};

/**
 * Parse resume file using Python API
 * @param {string} filePath - Path to resume file
 * @returns {Promise<Object>} Parsed resume data
 */
const parseResume = async (filePath) => {
  try {
    console.log(`Calling Python API to parse resume at ${PYTHON_API_BASE_URL}/parse-resume`);
    
    // Call Python API with increased timeout
    const response = await axios.post(
      `${PYTHON_API_BASE_URL}/parse-resume`,
      { file_path: filePath },
      { timeout: 290000 } // 290 seconds (just under 5 minutes)
    );
    
    return response.data;
  } catch (error) {
    console.error("Error parsing resume:", error.message);
    
    // Improved error handling
    if (error.code === 'ECONNABORTED' || (error.response && error.response.status === 504)) {
      console.log('Timeout occurred while processing PDF');
      return {
        summary: "The resume could not be processed automatically due to its complexity or size. Please try with a simpler PDF format.",
        experience: [],
        education: [],
        skills: [],
        accomplishments: [],
        total_experience_years: 0,
        processing_error: true
      };
    }
    
    return {
      summary: "Failed to parse resume automatically.",
      experience: [],
      education: [],
      skills: [],
      accomplishments: [],
      total_experience_years: 0
    };
  }
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
      where: { job_id: jobId },
      include: [
        {
          model: CriteriaSkill,
          as: "skills",
        },
        {
          model: CriteriaKeyword,
          as: "keywords",
        },
      ],
    });
    if (!resume || !criteria) {
      console.log("Resume or criteria not found");
      return null;
    }
    // Prepare resume data for evaluation
    const resumeData = {
      skills: resume.skills || [],
      experience_years: resume.experience_years || 0,
      education: resume.education || [],
      parsed_data: resume.parsed_data || {},
      summary: resume.parsed_data?.summary || "",
    };
    // Prepare criteria data for evaluation
    const criteriaData = {
      required_skills: criteria.skills.map((s) => s.skill_name),
      min_experience_years: criteria.min_experience_years || 0,
      mandatory_skills: criteria.skills
        .filter((s) => s.mandatory)
        .map((s) => s.skill_name),
      skill_weights: criteria.skills.reduce((obj, skill) => {
        obj[skill.skill_name] = skill.weight;
        return obj;
      }, {}),
      experience_weight: criteria.experience_weight || 0,
      keywords: criteria.keywords.map((k) => k.keyword),
    };
    console.log(`Calling Python API to evaluate resume at ${PYTHON_API_BASE_URL}/evaluate-resume`);
    // Call Python API with improved error handling
    try {
      const response = await axios.post(
        `${PYTHON_API_BASE_URL}/evaluate-resume`,
        {
          resume_data: resumeData,
          requirements: criteriaData,
        },
        {
          timeout: 120000, // Added 2 minute timeout for this request as well
        }
      );
      console.log("Evaluation response received");
      // Process evaluation results
      const evalResults = response.data;
      // Log response for debugging
      console.log(`Response received: ${JSON.stringify(evalResults).substring(0, 100)}...`);
      // Extract score information - assuming the first report is for our resume
      const report = evalResults.individual_reports && evalResults.individual_reports[0]?.report;
      if (!report) {
        console.log("No evaluation report in response");
        return null;
      }
      const evalSummary = report.evaluation_summary;
      // Create score record
      const score = await ResumeScore.create({
        resume_id: resumeId,
        criteria_id: criteria.id,
        total_score: evalSummary.total_score || 0,
        skills_score: evalSummary.skills_score || 0,
        experience_score: evalSummary.experience_score || 0,
        keyword_score: 0, // Update based on actual data structure
        missing_skills: [], // Update based on actual data structure
        matching_skills: [], // Update based on actual data structure
      });
      return score;
    } catch (axiosError) {
      console.error("Error calling evaluation API:", axiosError.message);
      if (axiosError.response) {
        console.error("Response data:", axiosError.response.data);
        console.error("Response status:", axiosError.response.status);
      }
      return null;
    }
  } catch (error) {
    console.error(`Error scoring resume: ${error.message}`);
    return null;
  }
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
          as: "candidate",
          attributes: ["id", "name", "email", "phone", "location"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
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
          as: "candidate",
          attributes: ["id", "name", "email", "phone", "location"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department", "status"],
        },
      ],
    });
    if (!resume) {
      throw new Error("Resume not found");
    }
    // Get scores if available
    const scores = await ResumeScore.findAll({
      where: { resume_id: id },
      include: [
        {
          model: CriteriaSet,
          as: "criteria",
          attributes: ["id", "name", "job_id"],
        },
      ],
    });
    return {
      ...resume.toJSON(),
      scores: scores || [],
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
      throw new Error("Resume not found");
    }
    if (!["pending", "shortlisted", "rejected"].includes(status)) {
      throw new Error(
        "Invalid status. Must be pending, shortlisted, or rejected"
      );
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
      throw new Error("Resume not found");
    }
    if (!job) {
      throw new Error("Job not found");
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
          as: "candidate",
          attributes: ["id", "name", "email"],
        },
        {
          model: ResumeScore,
          as: "scores",
          where: {
            [Op.and]: [{ "$CriteriaSet.job_id$": jobId }],
          },
          include: [
            {
              model: CriteriaSet,
              as: "criteria",
            },
          ],
        },
      ],
      order: [[{ model: ResumeScore, as: "scores" }, "total_score", "DESC"]],
      limit,
    });
    return resumes;
  } catch (error) {
    throw error;
  }
};

/**
 * Download resume file
 * @param {number} id - Resume ID
 * @returns {Promise<Object>} API response with file
 */
exports.downloadResumeFile = async (id) => {
  try {
    // Get resume details
    const resume = await Resume.findByPk(id);
   
    if (!resume) {
      throw new Error("Resume not found");
    }
   
    // Validate file path
    if (!resume.file_path) {
      throw new Error("Resume file not found");
    }
   
    // Read file (implementation depends on your storage solution)
    // For local files:
    const fs = require('fs');
    const fileContent = fs.readFileSync(resume.file_path);
    const fileName = resume.file_path.split('/').pop();
   
    // Return file
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf', // Adjust based on file type
        'Content-Disposition': `attachment; filename="${fileName}"`
      },
      body: fileContent.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    throw error;
  }
};
