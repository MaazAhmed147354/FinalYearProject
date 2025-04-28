const sequelize = require("../config/database");
const Users = require("../models/employeesModel");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const bcrypt = require("bcrypt");

const genJWTToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

exports.loginUser = async (body) => {
  try {
    await sequelize.sync();
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email and password are required",
        }),
      };
    }

    let user = await Users.findOne({ where: { email } });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            message: "Invalid password",
          }),
        };
      }

      let redirectUrl = "/employee";
      if (user.role === "HR") {
        redirectUrl = "/admin";
      } else if (user.role === "Department") {
        redirectUrl = "/manager";
      }

      const token = genJWTToken(user);
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
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    }
  } catch (error) {
    console.error("Error handling login request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
