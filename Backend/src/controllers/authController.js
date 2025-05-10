"use strict";

const authService = require("../services/authService");
const responseHelper = require("../utils/responseHelper");

/**
 * Handle user login
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.loginUser = async (event) => {
  try {
    const body = JSON.parse(event.body);
    if (!body.email || !body.password) {
      return responseHelper.errorResponse(
        400,
        "Email and password are required"
      );
    }

    // Just return what the service gives
    return await authService.loginUser(body.email, body.password);
  } catch (error) {
    console.error("Error in loginUser controller:", error);

    if (
      error.message === "User not found" ||
      error.message === "Invalid password"
    ) {
      return responseHelper.errorResponse(401, "Invalid email or password");
    }

    return responseHelper.errorResponse(
      500,
      "Internal Server Error",
      error.message
    );
  }
};

/**
 * Handle user registration
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.registerUser = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);

    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return responseHelper.errorResponse(
        400,
        "Name, email, password, and role are required"
      );
    }

    // Register new user
    const user = await authService.registerUser(body);

    // Return success
    return responseHelper.successResponse(
      201,
      "User registered successfully",
      user
    );
  } catch (error) {
    console.error("Error in registerUser controller:", error);

    // Handle specific errors
    if (error.message === "Email already in use") {
      return responseHelper.errorResponse(409, "Email already in use");
    }

    return responseHelper.errorResponse(
      500,
      "Internal Server Error",
      error.message
    );
  }
};

/**
 * Handle user logout
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.logoutUser = async (event) => {
  try {
    return await authService.logoutUser(event);
  } catch (error) {
    console.error("Error in logoutUser controller:", error);
    return responseHelper.errorResponse(
      500,
      "Internal Server Error",
      error.message
    );
  }
};
