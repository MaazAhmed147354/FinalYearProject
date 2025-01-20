"use strict";
require("dotenv").config();

const collaborationRoutes = require("./../routes/collaborationRoutes");

module.exports.addComment = collaborationRoutes.addComment;
module.exports.fetchNotifications = collaborationRoutes.fetchNotifications;
