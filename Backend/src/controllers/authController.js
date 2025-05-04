"use strict";

const authService = require('../services/authService');
const responseHelper = require('../utils/responseHelper');
const cookie = require('cookie');

/**
 * Handle user login
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.loginUser = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.email || !body.password) {
      return responseHelper.error(400, 'Email and password are required');
    }
    
    // Attempt login
    const result = await authService.loginUser(body.email, body.password);
    
    // Set cookie with JWT token
    const cookieHeader = cookie.serialize('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      maxAge: 43200, // 12 hours
      path: '/'
    });
    
    // Return success with redirect URL
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        user: result.user,
        redirectUrl: result.redirectUrl
      })
    };
  } catch (error) {
    console.error('Error in loginUser controller:', error);
    
    // Handle specific errors
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return responseHelper.error(401, 'Invalid email or password');
    }
    
    return responseHelper.error(500, 'Internal Server Error', error.message);
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
      return responseHelper.error(400, 'Name, email, password, and role are required');
    }
    
    // Register new user
    const user = await authService.registerUser(body);
    
    // Return success
    return responseHelper.success(201, 'User registered successfully', user);
  } catch (error) {
    console.error('Error in registerUser controller:', error);
    
    // Handle specific errors
    if (error.message === 'Email already in use') {
      return responseHelper.error(409, 'Email already in use');
    }
    
    return responseHelper.error(500, 'Internal Server Error', error.message);
  }
};

/**
 * Handle user logout
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.logoutUser = async (event) => {
  try {
    // Check if token cookie exists
    const cookies = cookie.parse(event.headers.Cookie || '');
    const token = cookies.token;
    
    if (token) {
      // Invalidate token
      await authService.logoutUser(token);
    }
    
    // Clear cookie
    const clearCookie = cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    // Return success
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': clearCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Logout successful'
      })
    };
  } catch (error) {
    console.error('Error in logoutUser controller:', error);
    return responseHelper.error(500, 'Internal Server Error', error.message);
  }
};

/**
 * Check if user is authenticated
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
exports.checkAuth = async (event) => {
  try {
    // Check if token cookie exists
    const cookies = cookie.parse(event.headers.Cookie || '');
    const token = cookies.token;
    
    if (!token) {
      return responseHelper.error(401, 'Not authenticated');
    }
    
    // Verify token
    const decoded = await authService.verifyToken(token);
    
    // Return user info
    return responseHelper.success(200, 'Authenticated', {
      isAuthenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('Error in checkAuth controller:', error);
    return responseHelper.error(401, 'Not authenticated');
  }
};
