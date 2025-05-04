const loggingService = require("../services/loggingService");
const responseHelper = require("../utils/responseHelper");

exports.loginUser = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const response = await loggingService.loginUser(body);

    return response;
  } catch (error) {
    console.error("Error in loginUser controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};