"use strict";
require("dotenv").config();

const resumeRoutes = require("./../routes/resumeRoutes");

module.exports.uploadResume = resumeRoutes.uploadResume;
module.exports.listResumes = resumeRoutes.listResumes;
module.exports.getResumeDetails = resumeRoutes.getResumeDetails;
module.exports.updateResumeStatus = resumeRoutes.updateResumeStatus;
