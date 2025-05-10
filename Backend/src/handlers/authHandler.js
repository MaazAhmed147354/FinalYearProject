"use strict";

require("dotenv").config();
const authRoutes = require("../routes/authRoutes");

module.exports.loginUser = authRoutes.loginUser;
module.exports.registerUser = authRoutes.registerUser;
module.exports.logoutUser = authRoutes.logoutUser;
