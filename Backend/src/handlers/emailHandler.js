"use strict";

require("dotenv").config();

const emailRoutes = require("./../routes/emailRoutes");

module.exports.syncEmails = emailRoutes.syncEmails;
module.exports.listEmails = emailRoutes.listEmails;
module.exports.sendEmail = emailRoutes.sendEmail;
module.exports.associateEmailWithJob = emailRoutes.associateEmailWithJob;
module.exports.updateEmailStatus = emailRoutes.updateEmailStatus;
module.exports.getEmailDetails = emailRoutes.getEmailDetails;
module.exports.extractResumesFromJob = emailRoutes.extractResumesFromJob;
module.exports.downloadEmailAttachment = emailRoutes.downloadEmailAttachment;
