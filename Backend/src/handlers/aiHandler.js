"use strict";

const axios = require('axios');
const { Resume, CriteriaSet } = require('../models');
const resumeService = require('../services/resumeService');

// Configure Python API endpoint
const PYTHON_API_BASE_URL = process.env.PYTHON_API_URL || 'http://localhost:3001/dev';

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

/**
 * Process a resume using the Python AI service
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Promise<Object>} Lambda response
 */
const processResume = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { file_path } = body;

    if (!file_path) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing file_path in request body' })
      };
    }

    // Parse resume using resumeService
    const parsedData = await resumeService.parseResume(file_path);

    // Return parsed data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(parsedData)
    };
  } catch (error) {
    console.error('Error processing resume:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to process resume',
        details: error.message
      })
    };
  }
};

module.exports = {
  evaluateResume,
  processResume
};