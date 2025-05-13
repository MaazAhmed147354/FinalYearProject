const interviewService = require("../services/interviewService");
const responseHelper = require("../utils/responseHelper");

/**
 * Helper function to transform interview response
 * @param {Object|Array} interview - Interview object or array of interviews
 * @returns {Object|Array} Transformed interview(s) with participants renamed to interviewers
 */
const transformInterviewResponse = (interview) => {
  // Handle arrays of interviews
  if (Array.isArray(interview)) {
    return interview.map(transformInterviewResponse);
  }
  
  // Handle null/undefined
  if (!interview) return interview;
  
  // Create a deep copy to avoid mutating the original
  const transformed = JSON.parse(JSON.stringify(interview));
  
  // Rename participants to interviewers
  if (transformed.participants) {
    transformed.interviewers = transformed.participants;
    delete transformed.participants;
  }
  
  return transformed;
};

/**
 * Schedule a new interview
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.scheduleInterview = async (event) => {
  try {
    const interviewData = JSON.parse(event.body);
    
    if (!interviewData.resume_id || !interviewData.job_id || !interviewData.date || !interviewData.time) {
      return responseHelper.validationErrorResponse({
        resume_id: "Resume ID is required",
        job_id: "Job ID is required",
        date: "Date is required",
        time: "Time is required"
      });
    }

    const interview = await interviewService.scheduleInterview(interviewData);
    const transformedInterview = transformInterviewResponse(interview);
    
    return responseHelper.successResponse(201, "Interview scheduled successfully", transformedInterview);
  } catch (error) {
    console.error("Error in scheduleInterview controller:", error);
    
    if (error.message === 'Resume not found') {
      return responseHelper.notFoundResponse('Resume');
    }
    
    if (error.message === 'Job not found') {
      return responseHelper.notFoundResponse('Job');
    }
    
    if (error.message === 'Missing required fields') {
      return responseHelper.validationErrorResponse({
        error: error.message
      });
    }
    
    return responseHelper.errorResponse(500, "Failed to schedule interview", error.message);
  }
};

/**
 * List all interviews with optional filters
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.listInterviews = async (event) => {
  try {
    const filters = event.queryStringParameters || {};
    const interviews = await interviewService.listInterviews(filters);
    const transformedInterviews = transformInterviewResponse(interviews);
    
    return responseHelper.successResponse(200, "Interviews retrieved successfully", transformedInterviews);
  } catch (error) {
    console.error("Error in listInterviews controller:", error);
    return responseHelper.errorResponse(500, "Failed to retrieve interviews", error.message);
  }
};

/**
 * Get interview details by ID
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.getInterviewDetails = async (event) => {
  try {
    const { id } = event.pathParameters;
    
    if (!id) {
      return responseHelper.validationErrorResponse({
        id: "Interview ID is required"
      });
    }
    
    const interview = await interviewService.getInterviewDetails(id);
    const transformedInterview = transformInterviewResponse(interview);
    
    return responseHelper.successResponse(200, "Interview details retrieved successfully", transformedInterview);
  } catch (error) {
    console.error("Error in getInterviewDetails controller:", error);
    
    if (error.message === 'Interview not found') {
      return responseHelper.notFoundResponse('Interview');
    }
    
    return responseHelper.errorResponse(500, "Failed to retrieve interview details", error.message);
  }
};

/**
 * Update interview details
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.updateInterview = async (event) => {
  try {
    const { id } = event.pathParameters;
    const interviewData = JSON.parse(event.body);
    
    if (!id) {
      return responseHelper.validationErrorResponse({
        id: "Interview ID is required"
      });
    }
    
    const updatedInterview = await interviewService.updateInterview(id, interviewData);
    const transformedInterview = transformInterviewResponse(updatedInterview);
    
    return responseHelper.successResponse(200, "Interview updated successfully", transformedInterview);
  } catch (error) {
    console.error("Error in updateInterview controller:", error);
    
    if (error.message === 'Interview not found') {
      return responseHelper.notFoundResponse('Interview');
    }
    
    return responseHelper.errorResponse(500, "Failed to update interview", error.message);
  }
};

/**
 * Cancel an interview
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.cancelInterview = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { reason } = JSON.parse(event.body);
    
    if (!id) {
      return responseHelper.validationErrorResponse({
        id: "Interview ID is required"
      });
    }

    const cancelledInterview = await interviewService.cancelInterview(id, reason);
    const transformedInterview = transformInterviewResponse(cancelledInterview);
    
    return responseHelper.successResponse(200, "Interview cancelled successfully", transformedInterview);
  } catch (error) {
    console.error("Error in cancelInterview controller:", error);
    
    if (error.message === 'Interview not found') {
      return responseHelper.notFoundResponse('Interview');
    }
    
    return responseHelper.errorResponse(500, "Failed to cancel interview", error.message);
  }
};

/**
 * Complete an interview and submit feedback
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.completeInterview = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { feedback } = JSON.parse(event.body);
    
    if (!id) {
      return responseHelper.validationErrorResponse({
        id: "Interview ID is required"
      });
    }

    const completedInterview = await interviewService.completeInterview(id, feedback);
    const transformedInterview = transformInterviewResponse(completedInterview);
    
    return responseHelper.successResponse(200, "Interview completed successfully", transformedInterview);
  } catch (error) {
    console.error("Error in completeInterview controller:", error);
    
    if (error.message === 'Interview not found') {
      return responseHelper.notFoundResponse('Interview');
    }
    
    return responseHelper.errorResponse(500, "Failed to complete interview", error.message);
  }
};

/**
 * Find available interview slots
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.findAvailableSlots = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    
    if (!params.date || !params.interviewers) {
      return responseHelper.validationErrorResponse({
        date: "Date is required",
        interviewers: "Interviewers are required"
      });
    }

    const slots = await interviewService.findAvailableSlots({
      ...params,
      interviewers: params.interviewers.split(',')
    });
    
    return responseHelper.successResponse(200, "Available slots retrieved successfully", slots);
  } catch (error) {
    console.error("Error in findAvailableSlots controller:", error);
    
    if (error.message === 'Missing required parameters') {
      return responseHelper.validationErrorResponse({
        error: error.message
      });
    }
    
    return responseHelper.errorResponse(500, "Failed to find available slots", error.message);
  }
};