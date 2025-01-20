"use strict";
require("dotenv").config();

const feedbackRoutes = require("../routes/feedbackRoutes");

module.exports.createFeedback = feedbackRoutes.createFeedback;
module.exports.getFeedback = feedbackRoutes.getFeedback;
