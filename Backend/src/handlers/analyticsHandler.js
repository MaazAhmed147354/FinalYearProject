"use strict";
require("dotenv").config();

const analyticsRoutes = require("../routes/analyticsRoutes");

module.exports.getJobAnalytics = analyticsRoutes.getJobAnalytics;
module.exports.getResumeAnalytics = analyticsRoutes.getResumeAnalytics;
module.exports.getInterviewAnalytics = analyticsRoutes.getInterviewAnalytics;
module.exports.getRecruitmentFunnelAnalytics = analyticsRoutes.getRecruitmentFunnelAnalytics;
