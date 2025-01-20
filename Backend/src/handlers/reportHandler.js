"use strict";
require("dotenv").config();

const reportRoutes = require("./../routes/reportRoutes");

module.exports.generateCandidateReport = reportRoutes.generateCandidateReport;
module.exports.compareCandidates = reportRoutes.compareCandidates;
