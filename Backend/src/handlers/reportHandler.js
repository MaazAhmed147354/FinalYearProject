"use strict";
require("dotenv").config();

const reportRoutes = require("./../routes/reportRoutes");

module.exports.generateCandidateReport = reportRoutes.generateCandidateReport;
module.exports.compareCandidates = reportRoutes.compareCandidates;
module.exports.getReportsForResume = reportRoutes.getReportsForResume;
module.exports.getReport = reportRoutes.getReport;
module.exports.markReportAsSent = reportRoutes.markReportAsSent;
