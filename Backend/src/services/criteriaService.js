"use strict";

const { CriteriaSet, CriteriaSkill, CriteriaKeyword, Job, Resume, ResumeScore } = require('../models');
const { Op } = require('sequelize');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Create a new criteria set for a job
 * @param {Object} criteriaData - Criteria data
 * @returns {Promise<Object>} Created criteria set
 */
exports.createCriteria = async (criteriaData) => {
  try {
    // Check if job exists
    const job = await Job.findByPk(criteriaData.job_id);
    if (!job) {
      throw new Error('Job not found');
    }

    // Check if criteria already exists for this job
    const existingCriteria = await CriteriaSet.findOne({
      where: { job_id: criteriaData.job_id }
    });

    // If exists, update rather than create
    if (existingCriteria) {
      return await updateCriteria(existingCriteria.id, criteriaData);
    }

    // Start a transaction to ensure all related records are created
    const result = await CriteriaSet.sequelize.transaction(async (t) => {
      // Create criteria set
      const criteriaSet = await CriteriaSet.create({
        job_id: criteriaData.job_id,
        name: criteriaData.name,
        experience_weight: criteriaData.experience_weight || 0,
        min_experience_years: criteriaData.min_experience_years || 0
      }, { transaction: t });

      // Create skills
      if (criteriaData.skills && Array.isArray(criteriaData.skills)) {
        for (const skill of criteriaData.skills) {
          await CriteriaSkill.create({
            criteria_id: criteriaSet.id,
            skill_name: skill.name,
            weight: skill.weight || 0,
            mandatory: skill.mandatory || false
          }, { transaction: t });
        }
      }

      // Create keywords
      if (criteriaData.keywords && Array.isArray(criteriaData.keywords)) {
        for (const keyword of criteriaData.keywords) {
          await CriteriaKeyword.create({
            criteria_id: criteriaSet.id,
            keyword: keyword
          }, { transaction: t });
        }
      }

      return criteriaSet;
    });

    // Get complete criteria with skills and keywords
    return await getCriteriaWithDetails(result.id);
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing criteria set
 * @param {number} id - Criteria set ID
 * @param {Object} criteriaData - Updated criteria data
 * @returns {Promise<Object>} Updated criteria set
 */
const updateCriteria = async (id, criteriaData) => {
  try {
    // Start a transaction to ensure all related records are updated
    const result = await CriteriaSet.sequelize.transaction(async (t) => {
      // Update criteria set
      const criteriaSet = await CriteriaSet.findByPk(id);
      await criteriaSet.update({
        name: criteriaData.name || criteriaSet.name,
        experience_weight: criteriaData.experience_weight !== undefined ? criteriaData.experience_weight : criteriaSet.experience_weight,
        min_experience_years: criteriaData.min_experience_years !== undefined ? criteriaData.min_experience_years : criteriaSet.min_experience_years
      }, { transaction: t });

      // Update skills (delete and recreate)
      if (criteriaData.skills && Array.isArray(criteriaData.skills)) {
        await CriteriaSkill.destroy({
          where: { criteria_id: id },
          transaction: t
        });

        for (const skill of criteriaData.skills) {
          await CriteriaSkill.create({
            criteria_id: id,
            skill_name: skill.name,
            weight: skill.weight || 0,
            mandatory: skill.mandatory || false
          }, { transaction: t });
        }
      }

      // Update keywords (delete and recreate)
      if (criteriaData.keywords && Array.isArray(criteriaData.keywords)) {
        await CriteriaKeyword.destroy({
          where: { criteria_id: id },
          transaction: t
        });

        for (const keyword of criteriaData.keywords) {
          await CriteriaKeyword.create({
            criteria_id: id,
            keyword: keyword
          }, { transaction: t });
        }
      }

      return criteriaSet;
    });

    // Get complete criteria with skills and keywords
    return await getCriteriaWithDetails(result.id);
  } catch (error) {
    throw error;
  }
};

/**
 * Get criteria set for a job
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Criteria set with skills and keywords
 */
exports.getCriteria = async (jobId) => {
  try {
    // Find criteria for job
    const criteriaSet = await CriteriaSet.findOne({
      where: { job_id: jobId },
      include: [
        {
          model: CriteriaSkill,
          as: 'skills'
        },
        {
          model: CriteriaKeyword,
          as: 'keywords'
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'required_skills']
        }
      ]
    });

    if (!criteriaSet) {
      throw new Error('Criteria not found for this job');
    }

    return criteriaSet;
  } catch (error) {
    throw error;
  }
};

/**
 * Get criteria set with associated skills and keywords
 * @param {number} id - Criteria set ID
 * @returns {Promise<Object>} Complete criteria set
 */
const getCriteriaWithDetails = async (id) => {
  try {
    return await CriteriaSet.findByPk(id, {
      include: [
        {
          model: CriteriaSkill,
          as: 'skills'
        },
        {
          model: CriteriaKeyword,
          as: 'keywords'
        }
      ]
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Apply shortlisting criteria to resumes
 * @param {Object} shortlistingData - Shortlisting parameters
 * @returns {Promise<Array>} Shortlisted resumes with scores
 */
exports.applyShortlistingCriteria = async (shortlistingData) => {
  try {
    const { job_id, threshold = 70, max_resumes = 0 } = shortlistingData;

    // Check if job exists
    const job = await Job.findByPk(job_id);
    if (!job) {
      throw new Error('Job not found');
    }

    // Get criteria for job
    const criteria = await CriteriaSet.findOne({
      where: { job_id },
      include: [
        {
          model: CriteriaSkill,
          as: 'skills'
        },
        {
          model: CriteriaKeyword,
          as: 'keywords'
        }
      ]
    });

    if (!criteria) {
      throw new Error('No criteria defined for this job');
    }

    // Get all resumes for this job
    const resumes = await Resume.findAll({
      where: { job_id },
      include: [
        {
          model: ResumeScore,
          as: 'scores',
          required: false,
          where: {
            criteria_id: criteria.id
          }
        },
        {
          model: Candidate,
          as: 'candidate',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // No resumes found
    if (resumes.length === 0) {
      return [];
    }

    // Process resumes that don't have scores yet
    const unprocessedResumes = resumes.filter(resume => !resume.scores || resume.scores.length === 0);
    
    // Use parallel processing for evaluating multiple resumes
    if (unprocessedResumes.length > 0) {
      await Promise.all(unprocessedResumes.map(resume => 
        evaluateResumeWithCriteria(resume, criteria)
      ));
    }

    // Get updated resume scores
    const updatedScores = await ResumeScore.findAll({
      where: { 
        resume_id: resumes.map(r => r.id),
        criteria_id: criteria.id
      },
      order: [['total_score', 'DESC']]
    });

    // Map scores to resumes
    const scoredResumes = resumes.map(resume => {
      const score = updatedScores.find(s => s.resume_id === resume.id);
      return {
        id: resume.id,
        candidate_name: resume.candidate?.name,
        candidate_email: resume.candidate?.email,
        status: resume.status,
        score: score ? score.total_score : 0,
        skills_score: score ? score.skills_score : 0,
        experience_score: score ? score.experience_score : 0,
        keyword_score: score ? score.keyword_score : 0,
        missing_skills: score ? score.missing_skills : [],
        matching_skills: score ? score.matching_skills : []
      };
    });

    // Sort by score and apply threshold
    const shortlisted = scoredResumes
      .sort((a, b) => b.score - a.score)
      .filter(resume => resume.score >= threshold);

    // Limit number of shortlisted resumes if specified
    if (max_resumes > 0 && shortlisted.length > max_resumes) {
      return shortlisted.slice(0, max_resumes);
    }

    return shortlisted;
  } catch (error) {
    throw error;
  }
};

/**
 * Evaluate a resume using criteria
 * @param {Object} resume - Resume to evaluate
 * @param {Object} criteria - Criteria to apply
 * @returns {Promise<Object>} Evaluation result
 */
const evaluateResumeWithCriteria = async (resume, criteria) => {
  try {
    // Execute Python evaluation script
    const pythonScript = path.join(__dirname, '../../models/evaluate_resume.py');
    
    // Prepare data for Python script
    const resumeData = JSON.stringify({
      skills: resume.skills || [],
      experience_years: resume.experience_years || 0,
      education: resume.education || [],
      parsed_data: resume.parsed_data || {}
    });
    
    const criteriaData = JSON.stringify({
      required_skills: criteria.skills.map(s => s.skill_name),
      min_experience_years: criteria.min_experience_years,
      mandatory_skills: criteria.skills.filter(s => s.mandatory).map(s => s.skill_name),
      skill_weights: criteria.skills.reduce((obj, skill) => {
        obj[skill.skill_name] = skill.weight;
        return obj;
      }, {}),
      experience_weight: criteria.experience_weight,
      keywords: criteria.keywords.map(k => k.keyword)
    });
    
    // Execute Python script
    const result = await new Promise((resolve, reject) => {
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
          resolve(evaluationData);
        } catch (error) {
          reject(new Error(`Error parsing JSON output: ${error.message}`));
        }
      });
    });
    
    // Save score to database
    await ResumeScore.create({
      resume_id: resume.id,
      criteria_id: criteria.id,
      total_score: result.total_score || 0,
      skills_score: result.skills_score || 0,
      experience_score: result.experience_score || 0,
      keyword_score: result.keyword_score || 0,
      missing_skills: result.missing_skills || [],
      matching_skills: result.matching_skills || []
    });
    
    return result;
  } catch (error) {
    console.error(`Error evaluating resume ${resume.id}:`, error);
    // Continue with next resume
    return null;
  }
};
