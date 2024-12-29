const sequelize = require("../config/database");
const Users = require("../models/employeesModel");
const Roles = require("../models/rolesModel");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const genJWTToken = (user) => {
  return jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

exports.loginUser = async (body) => {
  try {
    await sequelize.sync();
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email is required",
        }),
      };
    }

    let user = await Users.findOne({ where: { email } });

    if (user) {
      const role = await Roles.findOne({ where: { role_id: user.role_id } });

      if (!role) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Role not found for the user",
          }),
        };
      }

      let redirectUrl = "/employee";
      if (role.role_id === 1) {
        redirectUrl = "/admin";
      } else if (role.role_id === 2) {
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
      const userRole = await Roles.findOne({
        where: { role_name: "Employee" },
      });

      if (!userRole) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Employee role not found in the Role table",
          }),
        };
      }
      const name = email.split("@")[0];

      user = await Users.create({
        name,
        email,
        role_id: userRole.role_id,
      });

      const token = genJWTToken(user);
      return {
        statusCode: 201,
        headers: {
          "Set-Cookie": cookie.serialize("token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            maxAge: 12 * 60 * 60, // 12 hours
            path: "/",
          }),
        },
        body: JSON.stringify({
          message: "User created and logged in successfully!",
          redirectUrl: "/employee",
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