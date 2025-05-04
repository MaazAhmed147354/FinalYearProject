"use strict";

const jobController = require('../controllers/jobController');
const auth = require('../middlewares/authMiddleware');

/**
 * Create job route
 */
module.exports.createJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.createJob(event);
};

/**
 * List jobs route
 */
module.exports.listJobs = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.listJobs(event);
};

/**
 * Get job details route
 */
module.exports.getJobDetails = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.getJobDetails(event);
};

/**
 * Update job route
 */
module.exports.updateJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.updateJob(event);
};

/**
 * Delete job route
 */
module.exports.deleteJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.deleteJob(event);
};

/**
 * Close job route
 */
module.exports.closeJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.closeJob(event);
};

/**
 * Reopen job route
 */
module.exports.reopenJob = async (event) => {
  // Authorize request
  const authResult = await auth.authorizeToken(event, ['hr']);
  
  // If authorization fails, return the result
  if (authResult.statusCode !== 202) {
    return authResult;
  }
  
  return await jobController.reopenJob(event);
};
