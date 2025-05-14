"use strict";

const dashboardService = require("../services/dashboardService");
const responseHelper = require("../utils/responseHelper");

/**
 * Get dashboard statistics
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.getDashboardStats = async (event) => {
  try {
    const stats = await dashboardService.getDashboardStats();

    return responseHelper.successResponse(
      200,
      "Dashboard statistics retrieved successfully",
      {
        activeJobs: stats.activeJobs,
        totalApplications: stats.totalApplications,
        scheduledInterviews: stats.scheduledInterviews,
        jobs: stats.jobs,
      }
    );
  } catch (error) {
    console.error("Error in getDashboardStats controller:", error);
    return responseHelper.errorResponse(
      500,
      "Failed to retrieve dashboard statistics",
      error.message
    );
  }
};

/**
 * Import job openings from external source
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.importJobOpenings = async (event) => {
  try {
    const importResult = await dashboardService.importJobOpenings();

    return responseHelper.successResponse(200, importResult.message, {
      count: importResult.count,
    });
  } catch (error) {
    console.error("Error in importJobOpenings controller:", error);
    return responseHelper.errorResponse(
      500,
      "Failed to import job openings",
      error.message
    );
  }
};
