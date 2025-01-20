"use strict";
require("dotenv").config();

const criteriaRoutes = require("./../routes/criteriaRoutes");

module.exports.createCriteria = criteriaRoutes.createCriteria;
module.exports.getCriteria = criteriaRoutes.getCriteria;
module.exports.applyShortlistingCriteria = criteriaRoutes.applyShortlistingCriteria;
