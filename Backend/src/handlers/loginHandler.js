"use strict";
require("dotenv").config();

const loginRoutes = require("./../routes/loginRoutes");

module.exports.loginUser = loginRoutes.loginUser;