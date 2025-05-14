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
 * Parse resume file using Python API
 * @param {string} filePath - Path to resume file
 * @returns {Promise<Object>} Parsed resume data
 */
exports.parseResume = async (filePath) => {
  try {
    console.log(`Calling Python API to parse resume at ${PYTHON_API_BASE_URL}/parse-resume`);
    
    // Call Python API with file path
    const response = await axios.post(
      `${PYTHON_API_BASE_URL}/parse-resume`,
      { file_path: filePath },
      { timeout: 290000 } // 290 seconds timeout
    );
    
    console.log('Raw response from parse-resume:', JSON.stringify(response.data).substring(0, 500));

    // Initialize parsed data structure
    let parsedData = {
      summary: '',
      experience: [],
      education: [],
      skills: [],
      accomplishments: [],
      total_experience_years: 0
    };

    // Try to extract text from the response
    const rawText = response.data?.summary || '';
    
    try {
      // Extract skills
      parsedData.skills = extractSkills(rawText);

      // Extract education
      parsedData.education = extractEducation(rawText);

      // Extract experience
      parsedData.experience = extractExperience(rawText);

      // Calculate total experience years
      if (parsedData.experience && parsedData.experience.length > 0) {
        parsedData.total_experience_years = calculateExperienceYears(parsedData.experience);
      }

      // Set summary
      parsedData.summary = rawText.substring(0, 500);

      console.log('Processed parsed data:', {
        skills_count: parsedData.skills.length,
        experience_count: parsedData.experience.length,
        total_experience_years: parsedData.total_experience_years,
        education_count: parsedData.education.length
      });
    } catch (parseError) {
      console.error('Error during parsing:', parseError);
      // Keep the initialized empty structure if parsing fails
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    
    // Try to extract information from the file directly as fallback
    try {
      const fs = require('fs');
      const rawText = fs.readFileSync(filePath, 'utf8');
      
      const parsedData = {
        summary: rawText.substring(0, 500),
        experience: extractExperience(rawText),
        education: extractEducation(rawText),
        skills: extractSkills(rawText),
        accomplishments: [],
        total_experience_years: 0
      };

      // Calculate total experience years
      if (parsedData.experience && parsedData.experience.length > 0) {
        parsedData.total_experience_years = calculateExperienceYears(parsedData.experience);
      }

      return parsedData;
    } catch (fallbackError) {
      console.error('Fallback parsing failed:', fallbackError);
      return {
        summary: 'Failed to parse resume automatically.',
        experience: [],
        education: [],
        skills: [],
        accomplishments: [],
        total_experience_years: 0
      };
    }
  }
};

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
    const fileName = `${uuidv4()}_${file.originalname.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const fileBuffer = file.buffer || Buffer.from(file.data, "base64");
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
    const parsedData = await exports.parseResume(filePath);

    // Create resume record with sanitized data
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

    console.log('Resume data:', {
      skills: resume.skills,
      experience_years: resume.experience_years,
      parsed_data: resume.parsed_data ? Object.keys(resume.parsed_data) : null
    });

    // Prepare resume data for evaluation
    const resumeData = {
      skills: resume.skills || [],
      experience_years: resume.experience_years || 0,
      education: resume.education || [],
      parsed_data: resume.parsed_data || {},
      summary: resume.parsed_data?.summary || "",
      experience: resume.parsed_data?.experience || []
    };

    // Prepare criteria data for evaluation
    const criteriaData = {
      required_skills: criteria.skills.map((s) => s.skill_name.toLowerCase()),
      min_experience_years: criteria.min_experience_years || 0,
      mandatory_skills: criteria.skills
        .filter((s) => s.mandatory)
        .map((s) => s.skill_name.toLowerCase()),
      skill_weights: criteria.skills.reduce((obj, skill) => {
        obj[skill.skill_name.toLowerCase()] = skill.weight || 1;
        return obj;
      }, {}),
      experience_weight: criteria.experience_weight || 1,
      keywords: criteria.keywords.map((k) => k.keyword.toLowerCase())
    };

    console.log('Evaluation criteria:', criteriaData);

    // Calculate scores
    const matchingSkills = [];
    const missingSkills = [];
    let skillsScore = 0;
    let totalWeight = 0;

    // Normalize resume skills
    const normalizedResumeSkills = resumeData.skills.map(skill => {
      if (typeof skill === 'string') {
        return skill.toLowerCase().trim();
      }
      return '';
    }).filter(skill => skill.length > 0);

    // Calculate skills score with weighted matching
    criteriaData.required_skills.forEach(requiredSkill => {
      const weight = criteriaData.skill_weights[requiredSkill] || 1;
      totalWeight += weight;

      // Check for exact match or partial match
      const found = normalizedResumeSkills.some(skill => {
        return skill === requiredSkill || 
               skill.includes(requiredSkill) || 
               requiredSkill.includes(skill) ||
               // Handle common variations
               (skill.includes('js') && requiredSkill.includes('javascript')) ||
               (skill.includes('react') && requiredSkill.includes('reactjs')) ||
               (skill.includes('node') && requiredSkill.includes('nodejs'));
      });

      if (found) {
        matchingSkills.push(requiredSkill);
        // Apply weight to the score
        skillsScore += weight;
      } else {
        missingSkills.push(requiredSkill);
      }
    });

    // Normalize skills score to percentage
    skillsScore = totalWeight > 0 ? (skillsScore / totalWeight) * 100 : 0;

    // Calculate experience score
    let experienceScore = 0;
    if (criteriaData.min_experience_years > 0) {
      experienceScore = Math.min(100, 
        (resumeData.experience_years / criteriaData.min_experience_years) * 100
      );
      
      // Bonus for exceeding minimum experience
      if (resumeData.experience_years > criteriaData.min_experience_years) {
        experienceScore = Math.min(100, experienceScore + 10);
      }
    } else {
      experienceScore = Math.min(100, resumeData.experience_years * 20); // 5 years = 100%
    }

    // Calculate keyword score
    let keywordScore = 0;
    const resumeText = JSON.stringify(resumeData).toLowerCase();
    const matchedKeywords = [];

    if (criteriaData.keywords.length > 0) {
      criteriaData.keywords.forEach(keyword => {
        if (resumeText.includes(keyword)) {
          matchedKeywords.push(keyword);
          const occurrences = (resumeText.match(new RegExp(keyword, 'g')) || []).length;
          keywordScore += (100 / criteriaData.keywords.length) * Math.min(occurrences, 3) / 2;
        }
      });
      keywordScore = Math.min(100, keywordScore);
    } else {
      keywordScore = 75; // Default score if no keywords specified
    }

    // Calculate total score with weights
    const totalScore = (
      (skillsScore * 0.4) +
      (experienceScore * 0.4) +
      (keywordScore * 0.2)
    );

    // Generate strengths and improvements
    const strengths = [];
    const improvements = [];

    // Add skill-based feedback
    if (matchingSkills.length > 0) {
      strengths.push(`Strong technical skills in: ${matchingSkills.join(', ')}`);
    }
    if (missingSkills.length > 0) {
      improvements.push(`Could benefit from developing skills in: ${missingSkills.join(', ')}`);
    }

    // Add experience-based feedback
    if (experienceScore >= 80) {
      strengths.push(`Strong relevant experience of ${resumeData.experience_years} years`);
    } else if (experienceScore >= 50) {
      strengths.push(`Has moderate experience of ${resumeData.experience_years} years`);
    } else {
      improvements.push(`Could benefit from gaining more experience in the field`);
    }

    // Add keyword-based feedback
    if (matchedKeywords.length > 0) {
      strengths.push(`Shows expertise in key areas: ${matchedKeywords.join(', ')}`);
    }

    // Add education-based feedback
    if (resumeData.education && resumeData.education.length > 0) {
      const educationStr = resumeData.education.map(edu => 
        `${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}`
      ).join(', ');
      strengths.push(`Strong educational background: ${educationStr}`);
    }

    // Create or update score record
    const score = await ResumeScore.create({
      resume_id: resumeId,
      criteria_id: criteria.id,
      total_score: Math.round(totalScore * 10) / 10,
      skills_score: Math.round(skillsScore * 10) / 10,
      experience_score: Math.round(experienceScore * 10) / 10,
      keyword_score: Math.round(keywordScore * 10) / 10,
      matching_skills: JSON.stringify(matchingSkills),
      missing_skills: JSON.stringify(missingSkills),
      strengths: JSON.stringify(strengths),
      improvements: JSON.stringify(improvements)
    });

    console.log('Created score record:', {
      total_score: score.total_score,
      skills_score: score.skills_score,
      experience_score: score.experience_score,
      keyword_score: score.keyword_score,
      matching_skills: score.matching_skills,
      missing_skills: score.missing_skills
    });

    return score;
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

// Helper functions need to be defined before they are used
const extractExperience = (text) => {
  const experience = [];
  const sections = text.split(/\n(?=[A-Z\s]{2,}:)/);
  
  sections.forEach(section => {
    if (/EXPERIENCE|EMPLOYMENT|WORK HISTORY/i.test(section)) {
      const lines = section.split('\n').filter(line => line.trim().length > 0);
      
      let currentExp = {
        title: '',
        company: '',
        duration: '',
        description: ''
      };
      
      lines.forEach(line => {
        line = line.trim();
        
        // Skip section headers
        if (/EXPERIENCE|EMPLOYMENT|WORK HISTORY/i.test(line)) {
          return;
        }
        
        // Look for duration patterns (years, months)
        if (/\d+\s*(year|month|yr|mo)/i.test(line)) {
          if (currentExp.title) {
            experience.push({...currentExp});
            currentExp = {title: '', company: '', duration: '', description: ''};
          }
          currentExp.duration = line;
        }
        // Look for job titles
        else if (/engineer|developer|manager|analyst|intern/i.test(line)) {
          currentExp.title = line;
        }
        // Everything else goes to description
        else {
          currentExp.description += line + ' ';
        }
      });
      
      if (currentExp.title || currentExp.description) {
        experience.push(currentExp);
      }
    }
  });
  
  return experience;
};

const extractEducation = (text) => {
  const education = [];
  const sections = text.split(/\n(?=[A-Z\s]{2,}:)/);
  
  sections.forEach(section => {
    if (/EDUCATION|ACADEMIC|QUALIFICATION/i.test(section)) {
      const lines = section.split('\n').filter(line => line.trim().length > 0);
      
      let currentDegree = {
        degree: '',
        institution: '',
        year: ''
      };
      
      lines.forEach(line => {
        line = line.trim();
        
        // Skip section headers and empty lines
        if (/EDUCATION|ACADEMIC|QUALIFICATION/i.test(line) || line.length === 0) {
          return;
        }
        
        // Look for degree information
        if (/bachelor|master|phd|bsc|msc|be|b\.e|b\.tech|m\.tech/i.test(line)) {
          if (currentDegree.degree) {
            education.push({...currentDegree});
            currentDegree = {degree: '', institution: '', year: ''};
          }
          currentDegree.degree = line;
        }
        // Look for institution
        else if (/university|college|institute|school/i.test(line)) {
          currentDegree.institution = line;
        }
        // Look for year
        else if (/20\d{2}|19\d{2}/.test(line)) {
          currentDegree.year = line.match(/20\d{2}|19\d{2}/)[0];
        }
      });
      
      if (currentDegree.degree) {
        education.push(currentDegree);
      }
    }
  });
  
  return education;
};

const extractSkills = (text) => {
  // Define skills with proper escaping
  const skillPatterns = [
    'java\\b', 'python\\b', 'javascript\\b', 'react\\b', 'angular\\b', 
    'node(?:\\.js)?\\b', 'sql\\b', 'aws\\b', 'docker\\b', 'kubernetes\\b',
    'html\\b', 'css\\b', 'git\\b', 'c\\+\\+', 'c#', 'php\\b', 'ruby\\b',
    'swift\\b', 'kotlin\\b', 'flutter\\b', 'android\\b', 'ios\\b',
    'typescript\\b', 'mongodb\\b', 'mysql\\b', 'postgresql\\b', 'redis\\b',
    'graphql\\b', 'rest\\b', 'api\\b', 'mvc\\b', 'mvvm\\b', 'firebase\\b',
    'azure\\b', 'gcp\\b', 'next\\.js\\b', 'node\\b', 'web3\\b', 'metaverse\\b',
    'ai\\b', 'artificial\\s+intelligence\\b'
  ];

  const skillsSet = new Set();
  
  // Create a single regex pattern with all skills
  const skillPattern = new RegExp(skillPatterns.join('|'), 'gi');
  const matches = text.match(skillPattern) || [];
  matches.forEach(skill => skillsSet.add(skill.toLowerCase().trim()));

  // Look for skills in sections
  const sections = text.split(/\n(?=[A-Z\s]{2,}:)/);
  sections.forEach(section => {
    if (/SKILLS|TECHNOLOGIES|PROGRAMMING|TECHNICAL|LANGUAGES|TOOLS/i.test(section)) {
      const sectionSkills = section
        .split(/[,\n•:()]/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 2 && !s.includes('section'));
      sectionSkills.forEach(skill => skillsSet.add(skill));
    }
  });

  return Array.from(skillsSet);
};

const calculateExperienceYears = (experience) => {
  let totalYears = 0;
  experience.forEach(exp => {
    const duration = exp.duration.toLowerCase();
    const yearMatch = duration.match(/(\d+)\s*year/);
    const monthMatch = duration.match(/(\d+)\s*month/);
    
    if (yearMatch) {
      totalYears += parseInt(yearMatch[1]);
    }
    if (monthMatch) {
      totalYears += parseInt(monthMatch[1]) / 12;
    }
  });
  return Math.round(totalYears * 10) / 10;
};
