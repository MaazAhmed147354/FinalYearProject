const analyticsService = require('../services/analyticsService');
const responseHelper = require("../utils/responseHelper");

exports.getJobAnalytics = async (event) => {
  try {
    const analytics = await analyticsService.getJobAnalytics();
    return responseHelper.successResponse(200, analytics);
  } catch (error) {
    console.error("Error in getJobAnalytics controller:", error);
    return responseHelper.errorResponse(500, "Error getting job analytics", error.message);
  }
};

exports.getResumeAnalytics = async (event) => {
  try {
    const analytics = await analyticsService.getResumeAnalytics();
    return responseHelper.successResponse(200, analytics);
  } catch (error) {
    console.error("Error in getResumeAnalytics controller:", error);
    return responseHelper.errorResponse(500, "Error getting resume analytics", error.message);
  }
};

exports.getInterviewAnalytics = async (event) => {
  try {
    const analytics = await analyticsService.getInterviewAnalytics();
    return responseHelper.successResponse(200, analytics);
  } catch (error) {
    console.error("Error in getInterviewAnalytics controller:", error);
    return responseHelper.errorResponse(500, "Error getting interview analytics", error.message);
  }
};

exports.getRecruitmentFunnelAnalytics = async (event) => {
  try {
    const analytics = await analyticsService.getRecruitmentFunnelAnalytics();
    return responseHelper.successResponse(200, analytics);
  } catch (error) {
    console.error("Error in getRecruitmentFunnelAnalytics controller:", error);
    return responseHelper.errorResponse(500, "Error getting recruitment funnel analytics", error.message);
  }
};
