"use strict";

const axios = require('axios');
const { Resume, CriteriaSet } = require('../models');

// Configure Python API endpoint
const PYTHON_API_BASE_URL = process.env.PYTHON_API_URL || 'http://localhost:3001/dev';

/**
 * Parse resume file using Python API
 * @param {string} filePath - Path to resume file
 * @returns {Promise<Object>} Parsed resume data
 */
const parseResume = async (filePath) => {
  try {
    console.log(`Calling Python API to parse resume at ${PYTHON_API_BASE_URL}/parse-resume`);
    
    // Call Python API with file path
    const response = await axios.post(`${PYTHON_API_BASE_URL}/parse-resume`, {
      file_path: filePath
    });
    
    // Return parsed data
    return response.data;
  } catch (error) {
    console.error('Error parsing resume:', error.message);
    // Fallback to basic parsing if API fails
    return {
      summary: 'Failed to parse resume automatically.',
      experience: [],
      education: [],
      skills: [],
      accomplishments: [],
      total_experience_years: 0
    };
  }
};

/**
 * Evaluate resume using Python API
 * @param {Object} resume - Resume data
 * @param {Object} criteria - Criteria data
 * @returns {Promise<Object>} Evaluation results
 */
const evaluateResume = async (resume, criteria) => {
  try {
    // Prepare resume data for evaluation
    const resumeData = {
      skills: resume.skills || [],
      experience_years: resume.experience_years || 0,
      education: resume.education || [],
      parsed_data: resume.parsed_data || {},
      summary: resume.parsed_data?.summary || ''
    };
    
    // Prepare criteria data for evaluation
    const criteriaData = {
      required_skills: criteria.skills.map(s => s.skill_name),
      min_experience_years: criteria.min_experience_years || 0,
      mandatory_skills: criteria.skills.filter(s => s.mandatory).map(s => s.skill_name),
      skill_weights: criteria.skills.reduce((obj, skill) => {
        obj[skill.skill_name] = skill.weight;
        return obj;
      }, {}),
      experience_weight: criteria.experience_weight || 0,
      keywords: criteria.keywords.map(k => k.keyword)
    };
    
    console.log(`Calling Python API to evaluate resume at ${PYTHON_API_BASE_URL}/evaluate-resume`);
    
    // Call Python API
    const response = await axios.post(`${PYTHON_API_BASE_URL}/evaluate-resume`, {
      resume_data: resumeData,
      requirements: criteriaData
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error evaluating resume: ${error.message}`);
    throw error;
  }
};

module.exports = {
  parseResume,
  evaluateResume
};