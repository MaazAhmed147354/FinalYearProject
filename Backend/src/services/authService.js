"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const {
  addToBlacklist,
  isTokenBlacklisted,
} = require("../utils/tokenBlacklist");
const { User } = require("../models");

/**
 * Authenticate a user and generate JWT token stored in an HTTP-only cookie.
 * @param {string} email - User email
 * @param {string} password - User password (plaintext)
 * @returns {Promise<Object>} Object containing user data and token
 */
exports.loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    // Determine redirect URL based on role
    let redirectUrl = "/dashboard"; // Default
    if (user.role === "hr") {
      redirectUrl = "/hr-dashboard";
    } else if (user.role === "department") {
      redirectUrl = "/department-dashboard";
    }

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": cookie.serialize("token", token, {
          httpOnly: true,
          secure: false, // Set to true in production
          maxAge: 12 * 60 * 60, // 12 hours
          path: "/",
        }),
      },
      body: JSON.stringify({
        message: "Logged in successfully!",
        redirectUrl: redirectUrl,
      }),
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
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("Email already in use");
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
      department: userData.department || null,
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      created_at: newUser.created_at,
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
exports.logoutUser = async (event) => {
  try {
    const cookies = cookie.parse(event.headers.Cookie || "");
    const token = cookies.token;

    // Blacklist the token if it exists and isn't already blacklisted
    if (token && !isTokenBlacklisted(token)) {
      addToBlacklist(token);
    }

    // Clear the JWT cookie
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": cookie.serialize("token", "", {
          httpOnly: true,
          secure: false, // Set to true in production
          maxAge: -1, // Expire the cookie
          path: "/",
        }),
      },
      body: JSON.stringify({ message: "Logged out successfully!" }),
    };
  } catch (error) {
    console.error("Error in logoutUser service:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
