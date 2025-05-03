"use strict";

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authenticate a user and generate JWT token
 * @param {string} email - User email
 * @param {string} password - User password (plaintext)
 * @returns {Promise<Object>} Object containing user data and token
 */
exports.loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Determine redirect URL based on role
    let redirectUrl = '/dashboard';
    if (user.role === 'hr') {
      redirectUrl = '/dashboard';
    } else if (user.role === 'department') {
      redirectUrl = '/dashboard';
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token,
      redirectUrl
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
exports.registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Create user
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password_hash: passwordHash,
      role: userData.role,
      department: userData.department || null
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      created_at: newUser.created_at
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user by invalidating token
 * @param {string} token - JWT token to invalidate
 * @returns {Promise<boolean>} Success status
 */
exports.logoutUser = async (token) => {
  try {
    // Add token to blacklist
    // In a real application, you would store invalidated tokens in Redis or a database
    // For now, we'll just return success
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded token payload
 */
exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};