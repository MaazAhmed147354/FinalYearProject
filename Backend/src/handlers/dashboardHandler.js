"use strict";
require("dotenv").config();

const dashboardRoutes = require("./../routes/dashboardRoutes");

module.exports.getDashboardStats = dashboardRoutes.getDashboardStats;
module.exports.importJobOpenings = dashboardRoutes.importJobOpenings;
