"use strict";

const analyticsController = require("../controllers/analyticsController");
const auth = require("../middlewares/authMiddleware");

// Get Job Analytics
module.exports.getJobAnalytics = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await analyticsController.getJobAnalytics(event);
};

// Get Resume Analytics
module.exports.getResumeAnalytics = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await analyticsController.getResumeAnalytics(event);
};

// Get Interview Analytics
module.exports.getInterviewAnalytics = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await analyticsController.getInterviewAnalytics(event);
};

// Get Recruitment Funnel Analytics
module.exports.getRecruitmentFunnelAnalytics = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await analyticsController.getRecruitmentFunnelAnalytics(event);
};
