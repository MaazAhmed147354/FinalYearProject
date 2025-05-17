"use strict";

const responseHelper = require("../utils/responseHelper");
const { Resume, Candidate, Job, User, Report, ResumeScore } = require("../models");
const reportService = require("../services/reportService");

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
    
    // Use the reportService to generate the report
    try {
      const report = await reportService.generateCandidateReport(resume_id, user_id);
      return responseHelper.successResponse(201, "Candidate report generated successfully", report);
    } catch (reportError) {
      if (reportError.message === 'Resume not found') {
        return responseHelper.notFoundResponse('Resume');
      }
      throw reportError;
    }
  } catch (error) {
    console.error("Error in generateCandidateReport:", error);
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
    
    const comparison = await reportService.compareResumes(resume_ids);
    return responseHelper.successResponse(200, "Candidates compared successfully", comparison);
  } catch (error) {
    console.error("Error in compareCandidates:", error);
   
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
    
    const reports = await Report.findAll({
      where: { resume_id },
      include: [
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Parse the content field from JSON string to object for each report
    const parsedReports = reports.map(report => {
      const reportJSON = report.toJSON();
      try {
        if (reportJSON.content && typeof reportJSON.content === 'string') {
          reportJSON.content = JSON.parse(reportJSON.content);
        }
      } catch (parseError) {
        console.error(`Error parsing content for report ${reportJSON.id}:`, parseError);
      }
      return reportJSON;
    });
    
    return responseHelper.successResponse(200, "Reports retrieved successfully", parsedReports);
  } catch (error) {
    console.error("Error in getReportsForResume:", error);
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
    
    const report = await Report.findByPk(report_id, {
      include: [
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            },
            {
              model: Job,
              as: 'job'
            }
          ]
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!report) {
      return responseHelper.notFoundResponse('Report');
    }
    
    // Parse the content field from JSON string to object
    try {
      const reportJSON = report.toJSON();
      if (reportJSON.content && typeof reportJSON.content === 'string') {
        reportJSON.content = JSON.parse(reportJSON.content);
      }
      return responseHelper.successResponse(200, "Report retrieved successfully", reportJSON);
    } catch (parseError) {
      console.error("Error parsing report content:", parseError);
      return responseHelper.successResponse(200, "Report retrieved successfully", report);
    }
  } catch (error) {
    console.error("Error in getReport:", error);
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
    
    const report = await Report.findByPk(report_id);
    
    if (!report) {
      return responseHelper.notFoundResponse('Report');
    }
    
    await report.update({ sent: true });
    
    return responseHelper.successResponse(200, "Report marked as sent successfully", report);
  } catch (error) {
    console.error("Error in markReportAsSent:", error);
    return responseHelper.errorResponse(500, "Failed to mark report as sent", error.message);
  }
};