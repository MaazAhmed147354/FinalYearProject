"use strict";

const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { User } = require("../models"); // No separate Roles table, using Users table
const {
  addToBlacklist,
  isTokenBlacklisted,
} = require("../utils/tokenBlacklist");
const authHandler = require("../handlers/authHandler");

/**
 * Authorize token middleware
 * @param {Object} event - API Gateway Lambda event
 * @param {Array} requiredRoles - Roles required for access (optional)
 * @returns {Promise<Object>} Authorization result
 */
exports.authorizeToken = async (event, requiredRoles = []) => {
  let token;
  const cookies = cookie.parse(event.headers.Cookie || "");
  token = cookies.token;
  
  // If token is missing, log out user immediately
  if (!token) {
    console.log("Missing token, logging out user...");
    return await authHandler.logoutUser(event);
  }

  // Check if token is blacklisted, log out if needed
  if (isTokenBlacklisted(token)) {
    console.log("Blacklisted token, logging out user...");
    return await authHandler.logoutUser(event);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiration
    if (decoded.exp * 1000 < Date.now()) {
      console.log("Expired token, logging out user...");
      return await authHandler.logoutUser(event);
    }

    // Fetch user from database
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      console.log("User not found, logging out...");
      return await authHandler.logoutUser(event);
    }

    // Check if the user's role is among the required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      console.log("Unauthorized role access attempt, logging out...");
      return await authHandler.logoutUser(event);
    }

    return {
      statusCode: 202, // Accepted
      body: JSON.stringify({
        success: true,
        message: "Token is valid",
        user: {
          id: user.id,
          email: user.email,
          role: user.role, // Directly getting role from Users table
        },
      }),
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return await authHandler.logoutUser(event);
  }
};

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 */
exports.addToBlacklist = (token) => {
  addToBlacklist(token);
};
