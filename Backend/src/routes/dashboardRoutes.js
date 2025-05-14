"use strict";

const dashboardController = require("../controllers/dashboardController");
const auth = require("../middlewares/authMiddleware");

// Get Dashboard Statistics
module.exports.getDashboardStats = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await dashboardController.getDashboardStats(event);
};

// Import Job Openings - Allow any authenticated user
module.exports.importJobOpenings = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await dashboardController.importJobOpenings(event);
};
