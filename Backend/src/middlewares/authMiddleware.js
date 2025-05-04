"use strict";

const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { User } = require('../models');
const { addToBlacklist, isTokenBlacklisted } = require('../utils/tokenBlacklist');

/**
 * Authorize token middleware
 * @param {Object} event - API Gateway Lambda event
 * @param {Array} requiredRoles - Roles required for access (optional)
 * @returns {Promise<Object>} Authorization result
 */
exports.authorizeToken = async (event, requiredRoles = []) => {
  // Get token from cookie
  let token;
  
  if (event.headers && event.headers.Cookie) {
    const cookies = cookie.parse(event.headers.Cookie);
    token = cookies.token;
  }
  
  // Check if token exists
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        message: 'Authentication required'
      })
    };
  }
  
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        message: 'Invalid token'
      })
    };
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp * 1000 < Date.now()) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: 'Token expired'
        })
      };
    }
    
    // If role check is required
    if (requiredRoles.length > 0) {
      // Check if user's role is in the required roles
      if (!requiredRoles.includes(decoded.role)) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            success: false,
            message: 'Access denied'
          })
        };
      }
    }
    
    // Authorization successful
    return {
      statusCode: 202, // Accepted
      body: JSON.stringify({
        success: true,
        message: 'Token is valid',
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      })
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        message: 'Invalid token'
      })
    };
  }
};

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 */
exports.addToBlacklist = (token) => {
  addToBlacklist(token);
};
