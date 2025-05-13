"use strict";

const interviewController = require("../controllers/interviewController");
const auth = require("../middlewares/authMiddleware");

// Schedule Interview
module.exports.scheduleInterview = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.scheduleInterview(event);
};

// List Interviews
module.exports.listInterviews = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.listInterviews(event);
};

// Update Interview
module.exports.updateInterview = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.updateInterview(event);
};

// Get Interview Details
module.exports.getInterviewDetails = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.getInterviewDetails(event);
};

// Cancel Interview
module.exports.cancelInterview = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.cancelInterview(event);
};

// Complete Interview
module.exports.completeInterview = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.completeInterview(event);
};

// Find Available Interview Slots
module.exports.findAvailableSlots = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await interviewController.findAvailableSlots(event);
};
