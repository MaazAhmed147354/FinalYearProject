"use strict";

const resumeController = require('../controllers/resumeController');
const auth = require('../middlewares/authMiddleware');

/**
 * Upload resume route
 */
module.exports.uploadResume = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.uploadResume(event);
};

/**
 * List resumes route
 */
module.exports.listResumes = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.listResumes(event);
};

/**
 * Get resume details route
 */
module.exports.getResumeDetails = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.getResumeDetails(event);
};

/**
 * Update resume status route
 */
module.exports.updateResumeStatus = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr', 'department']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.updateResumeStatus(event);
};

/**
 * Associate resume with job route
 */
module.exports.associateResumeWithJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.associateResumeWithJob(event);
};

/**
 * Get top scored resumes for job route
 */
module.exports.getTopScoredResumesForJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.getTopScoredResumesForJob(event);
};

/**
 * Download resume file route
 */
module.exports.downloadResumeFile = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await resumeController.downloadResumeFile(event);
};
