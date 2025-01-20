"use strict";
require("dotenv").config();

const interviewRoutes = require("./../routes/interviewRoutes");

module.exports.scheduleInterview = interviewRoutes.scheduleInterview;
module.exports.listInterviews = interviewRoutes.listInterviews;
module.exports.updateInterview = interviewRoutes.updateInterview;
