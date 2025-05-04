"use strict";

const criteriaController = require("./../controllers/criteriaController");
const auth = require("../middlewares/authMiddleware");

// Create shortlisting criteria
module.exports.createCriteria = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await criteriaController.createCriteria(event);
};

// Get criteria for a specific job
module.exports.getCriteria = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await criteriaController.getCriteria(event);
};

// Apply criteria to shortlist resumes
module.exports.applyShortlistingCriteria = async (event) => {
  const authResult = await auth.authorizeToken(event, ['hr']);
  if (authResult.statusCode !== 202) return authResult;

  return await criteriaController.applyShortlistingCriteria(event);
};
