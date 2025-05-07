"use strict";

const jobService = require('../services/jobService');
const responseHelper = require('../utils/responseHelper');

/**
 * Create a new job opening
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.createJob = async (event) => {
  try {
    // Parse request body
    const jobData = JSON.parse(event.body);
    
    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.department || !jobData.created_by) {
      return responseHelper.errorResponse(400, 'Missing required fields');
    }
    
    // Create job
    const job = await jobService.createJob(jobData);
    
    // Return success
    return responseHelper.successResponse(201, 'Job created successfully', job);
  } catch (error) {
    console.error('Error in createJob controller:', error);
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * List jobs with optional filters
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.listJobs = async (event) => {
  try {
    // Extract filter parameters from query string
    const filters = event.queryStringParameters || {};
    
    // Get jobs
    const jobs = await jobService.listJobs(filters);
    
    // Return success
    return responseHelper.successResponse(200, 'Jobs retrieved successfully', jobs);
  } catch (error) {
    console.error('Error in listJobs controller:', error);
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Get job details by ID
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.getJobDetails = async (event) => {
  try {
    // Extract job ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Job ID is required');
    }
    
    // Get job details
    const job = await jobService.getJobDetails(id);
    
    // Return success
    return responseHelper.successResponse(200, 'Job details retrieved successfully', job);
  } catch (error) {
    console.error('Error in getJobDetails controller:', error);
    
    // Handle specific errors
    if (error.message === 'Job not found') {
      return responseHelper.errorResponse(404, 'Job not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Update job details
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.updateJob = async (event) => {
  try {
    // Extract job ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Job ID is required');
    }
    
    // Parse request body
    const jobData = JSON.parse(event.body);
    
    // Update job
    const job = await jobService.updateJob(id, jobData);
    
    // Return success
    return responseHelper.successResponse(200, 'Job updated successfully', job);
  } catch (error) {
    console.error('Error in updateJob controller:', error);
    
    // Handle specific errors
    if (error.message === 'Job not found') {
      return responseHelper.errorResponse(404, 'Job not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Delete a job
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.deleteJob = async (event) => {
  try {
    // Extract job ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Job ID is required');
    }
    
    // Delete job
    await jobService.deleteJob(id);
    
    // Return success
    return responseHelper.successResponse(204, 'Job deleted successfully');
  } catch (error) {
    console.error('Error in deleteJob controller:', error);
    
    // Handle specific errors
    if (error.message === 'Job not found') {
      return responseHelper.errorResponse(404, 'Job not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Close a job
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.closeJob = async (event) => {
  try {
    // Extract job ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Job ID is required');
    }
    
    // Close job
    const job = await jobService.closeJob(id);
    
    // Return success
    return responseHelper.successResponse(200, 'Job closed successfully', job);
  } catch (error) {
    console.error('Error in closeJob controller:', error);
    
    // Handle specific errors
    if (error.message === 'Job not found') {
      return responseHelper.errorResponse(404, 'Job not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Reopen a job
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.reopenJob = async (event) => {
  try {
    // Extract job ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Job ID is required');
    }
    
    // Reopen job
    const job = await jobService.reopenJob(id);
    
    // Return success
    return responseHelper.successResponse(200, 'Job reopened successfully', job);
  } catch (error) {
    console.error('Error in reopenJob controller:', error);
    
    // Handle specific errors
    if (error.message === 'Job not found') {
      return responseHelper.errorResponse(404, 'Job not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};
