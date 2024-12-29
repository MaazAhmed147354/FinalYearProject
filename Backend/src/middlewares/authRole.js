const jwt = require("jsonwebtoken");
const Users = require("../models/employeesModel");
const Roles = require("../models/rolesModel");
const cookie = require("cookie");
const logoutService = require("../services/logoutService");
const { isTokenBlacklisted } = require("../utils/blacklistTokens");

exports.authorizeToken = async (event, requiredRoles = []) => {
  let token;
  const cookies = cookie.parse(event.headers.Cookie || "");
  token = cookies.token;

  if (!token) {
    return await logoutService.logoutUser(event);
  }

  // Check if the token is blacklisted
  if (isTokenBlacklisted(token)) {
    console.log("Token is blacklisted, logging out user");
    return await logoutService.logoutUser(event);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check the expiration of the token
    if (decoded.exp * 1000 < Date.now()) {
      // Token is expired, log out the user
      return await logoutService.logoutUser(event);
    }

    let user = await Users.findOne({ where: { user_id: decoded.id } });
    const role = await Roles.findOne({ where: { role_id: user.role_id } });

    // Check if the user's role is in the required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(role.role_name)) {
      // User does not have the required role, log out the user
      return await logoutService.logoutUser(event);
    }

    return {
      statusCode: 202, // statusCode: 202 means Accepted // Could not use 200 Ok due logout response also returning 200
      body: JSON.stringify({ message: "Token is valid", decoded }),
    };
  } catch (err) {
    // Token verification failed, log out the user
    return await logoutService.logoutUser(event);
  }
};

exports.addToBlacklist = (token) => {
  blackList.add(token);
};