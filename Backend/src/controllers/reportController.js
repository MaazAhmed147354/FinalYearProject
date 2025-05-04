const reportService = require("../services/reportService");
const responseHelper = require("../utils/responseHelper");

/**
 * Generate a detailed report for a candidate
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.generateCandidateReport = async (event) => {
  try {
    const { resume_id, user_id } = JSON.parse(event.body);
    
    if (!resume_id || !user_id) {
      return responseHelper.validationErrorResponse({
        resume_id: "Resume ID is required",
        user_id: "User ID is required"
      });
    }

    const report = await reportService.generateCandidateReport(resume_id, user_id);
    return responseHelper.successResponse(201, "Candidate report generated successfully", report);
  } catch (error) {
    console.error("Error in generateCandidateReport controller:", error);
    
    if (error.message === 'Resume not found') {
      return responseHelper.notFoundResponse('Resume');
    }
    
    return responseHelper.errorResponse(500, "Failed to generate candidate report", error.message);
  }
};

/**
 * Compare multiple candidates side-by-side
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.compareCandidates = async (event) => {
  try {
    const { resume_ids } = JSON.parse(event.body);
    
    if (!resume_ids) {
      return responseHelper.validationErrorResponse({
        resume_ids: "Resume IDs are required"
      });
    }

    const comparison = await reportService.compareCandidates(resume_ids);
    return responseHelper.successResponse(200, "Candidates compared successfully", comparison);
  } catch (error) {
    console.error("Error in compareCandidates controller:", error);
    
    if (error.message === 'At least two candidates are required for comparison') {
      return responseHelper.validationErrorResponse({
        resume_ids: error.message
      });
    }
    
    if (error.message.includes('not found')) {
      return responseHelper.notFoundResponse(error.message);
    }
    
    return responseHelper.errorResponse(500, "Failed to compare candidates", error.message);
  }
};

/**
 * Get all reports for a specific resume
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.getReportsForResume = async (event) => {
  try {
    const { resume_id } = event.pathParameters;
    
    if (!resume_id) {
      return responseHelper.validationErrorResponse({
        resume_id: "Resume ID is required"
      });
    }

    const reports = await reportService.getReportsForResume(resume_id);
    return responseHelper.successResponse(200, "Reports retrieved successfully", reports);
  } catch (error) {
    console.error("Error in getReportsForResume controller:", error);
    return responseHelper.errorResponse(500, "Failed to retrieve reports", error.message);
  }
};

/**
 * Get a specific report by ID
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.getReport = async (event) => {
  try {
    const { report_id } = event.pathParameters;
    
    if (!report_id) {
      return responseHelper.validationErrorResponse({
        report_id: "Report ID is required"
      });
    }

    const report = await reportService.getReport(report_id);
    return responseHelper.successResponse(200, "Report retrieved successfully", report);
  } catch (error) {
    console.error("Error in getReport controller:", error);
    
    if (error.message === 'Report not found') {
      return responseHelper.notFoundResponse('Report');
    }
    
    return responseHelper.errorResponse(500, "Failed to retrieve report", error.message);
  }
};

/**
 * Mark a report as sent
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.markReportAsSent = async (event) => {
  try {
    const { report_id } = JSON.parse(event.body);
    
    if (!report_id) {
      return responseHelper.validationErrorResponse({
        report_id: "Report ID is required"
      });
    }

    const report = await reportService.markReportAsSent(report_id);
    return responseHelper.successResponse(200, "Report marked as sent successfully", report);
  } catch (error) {
    console.error("Error in markReportAsSent controller:", error);
    
    if (error.message === 'Report not found') {
      return responseHelper.notFoundResponse('Report');
    }
    
    return responseHelper.errorResponse(500, "Failed to mark report as sent", error.message);
  }
};
