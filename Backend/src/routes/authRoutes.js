"use strict";

const authController = require("../controllers/authController");

// Login user route
exports.loginUser = async (event) => {
  return await authController.loginUser(event);
};

// Register user route
exports.registerUser = async (event) => {
  return await authController.registerUser(event);
};

// Logout user route
exports.logoutUser = async (event) => {
  return await authController.logoutUser(event);
};
