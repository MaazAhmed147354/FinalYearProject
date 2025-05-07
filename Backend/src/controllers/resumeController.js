"use strict";

const resumeService = require('../services/resumeService');
const responseHelper = require('../utils/responseHelper');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const AWS = require('aws-sdk');

/**
 * Upload a resume
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.uploadResume = async (event) => {
  try {
    // Parse multipart form data (file and metadata)
    // For serverless, we need to handle file uploads differently
    // Here we're assuming a base64 encoded file in the request body
    
    const body = JSON.parse(event.body);
    const fileData = body.file;
    const resumeData = body.resumeData;
    
    if (!fileData || !resumeData) {
      return responseHelper.errorResponse(400, 'File and resume data are required');
    }
    
    // Validate required fields
    if (!resumeData.candidate_name || !resumeData.candidate_email) {
      return responseHelper.errorResponse(400, 'Candidate name and email are required');
    }
    
    // Convert base64 to file buffer
    const fileParts = fileData.split(';base64,');
    const fileType = fileParts[0].split(':')[1];
    const fileBuffer = Buffer.from(fileParts[1], 'base64');
    
    // Create file object
    const file = {
      originalname: resumeData.filename || 'resume.pdf',
      mimetype: fileType,
      buffer: fileBuffer,
      size: fileBuffer.length,
      data: fileBuffer
    };
    
    // Upload resume
    const resume = await resumeService.uploadResume(resumeData, file);
    
    // Return success
    return responseHelper.successResponse(201, 'Resume uploaded successfully', resume);
  } catch (error) {
    console.error('Error in uploadResume controller:', error);
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * List resumes with optional filters
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.listResumes = async (event) => {
  try {
    // Extract filter parameters
    const filters = event.queryStringParameters || {};
    
    // Get resumes
    const resumes = await resumeService.listResumes(filters);
    
    // Return success
    return responseHelper.successResponse(200, 'Resumes retrieved successfully', resumes);
  } catch (error) {
    console.error('Error in listResumes controller:', error);
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Get resume details by ID
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.getResumeDetails = async (event) => {
  try {
    // Extract resume ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Resume ID is required');
    }
    
    // Get resume details
    const resume = await resumeService.getResumeDetails(id);
    
    // Return success
    return responseHelper.successResponse(200, 'Resume details retrieved successfully', resume);
  } catch (error) {
    console.error('Error in getResumeDetails controller:', error);
    
    // Handle specific errors
    if (error.message === 'Resume not found') {
      return responseHelper.errorResponse(404, 'Resume not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Update resume status
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.updateResumeStatus = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.id || !body.status) {
      return responseHelper.errorResponse(400, 'Resume ID and status are required');
    }
    
    // Update status
    const resume = await resumeService.updateResumeStatus(body.id, body.status);
    
    // Return success
    return responseHelper.successResponse(200, 'Resume status updated successfully', resume);
  } catch (error) {
    console.error('Error in updateResumeStatus controller:', error);
    
    // Handle specific errors
    if (error.message === 'Resume not found') {
      return responseHelper.errorResponse(404, 'Resume not found');
    }
    
    if (error.message.includes('Invalid status')) {
      return responseHelper.errorResponse(400, error.message);
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Associate resume with job
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.associateResumeWithJob = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.resume_id || !body.job_id) {
      return responseHelper.errorResponse(400, 'Resume ID and Job ID are required');
    }
    
    // Associate resume with job
    const resume = await resumeService.associateResumeWithJob(body.resume_id, body.job_id);
    
    // Return success
    return responseHelper.successResponse(200, 'Resume associated with job successfully', resume);
  } catch (error) {
    console.error('Error in associateResumeWithJob controller:', error);
    
    // Handle specific errors
    if (error.message === 'Resume not found') {
      return responseHelper.errorResponse(404, 'Resume not found');
    }
    
    if (error.message === 'Job not found') {
      return responseHelper.errorResponse(404, 'Job not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Get top scored resumes for a job
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.getTopScoredResumesForJob = async (event) => {
  try {
    // Extract parameters
    const { jobId } = event.pathParameters;
    const { limit } = event.queryStringParameters || {};
    
    if (!jobId) {
      return responseHelper.errorResponse(400, 'Job ID is required');
    }
    
    // Get top scored resumes
    const resumes = await resumeService.getTopScoredResumesForJob(jobId, limit ? parseInt(limit, 10) : 10);
    
    // Return success
    return responseHelper.successResponse(200, 'Top scored resumes retrieved successfully', resumes);
  } catch (error) {
    console.error('Error in getTopScoredResumesForJob controller:', error);
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};

/**
 * Download resume file
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response with file
 */
exports.downloadResumeFile = async (event) => {
  try {
    // Extract resume ID from path parameters
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.errorResponse(400, 'Resume ID is required');
    }
    
    // Get resume details
    const resume = await resumeService.getResumeDetails(id);
    
    // Validate file path
    if (!resume.file_path) {
      return responseHelper.errorResponse(404, 'Resume file not found');
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
    console.error('Error in downloadResumeFile controller:', error);
    
    // Handle specific errors
    if (error.message === 'Resume not found') {
      return responseHelper.errorResponse(404, 'Resume not found');
    }
    
    return responseHelper.errorResponse(500, 'Internal Server Error', error.message);
  }
};
