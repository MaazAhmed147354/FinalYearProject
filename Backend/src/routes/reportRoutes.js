"use strict";

const reportController = require("../controllers/reportController");
const auth = require("../middlewares/authMiddleware");

// Generate Candidate Report
module.exports.generateCandidateReport = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await reportController.generateCandidateReport(event);
};

// Compare Candidates
module.exports.compareCandidates = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await reportController.compareCandidates(event);
};

// Get All Reports for a Resume
module.exports.getReportsForResume = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await reportController.getReportsForResume(event);
};

// Get Single Report by ID
module.exports.getReport = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await reportController.getReport(event);
};

// Mark Report as Sent
module.exports.markReportAsSent = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await reportController.markReportAsSent(event);
};
