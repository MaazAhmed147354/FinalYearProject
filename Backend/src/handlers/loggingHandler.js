"use strict";
require("dotenv").config();

const loginRoutes = require("../routes/loggingRoutes");

module.exports.loginUser = loginRoutes.loginUser;