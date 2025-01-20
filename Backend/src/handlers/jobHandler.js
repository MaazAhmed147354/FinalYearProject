"use strict";
require("dotenv").config();

const jobRoutes = require("../routes/jobRoutes");

module.exports.createJob = jobRoutes.createJob;
module.exports.listJobs = jobRoutes.listJobs;
module.exports.getJobDetails = jobRoutes.getJobDetails;
module.exports.updateJob = jobRoutes.updateJob;
module.exports.deleteJob = jobRoutes.deleteJob;
