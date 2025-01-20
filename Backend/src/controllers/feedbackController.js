const feedbackService = require('../services/feedbackService');
const responseHelper = require("../utils/responseHelper");

exports.createFeedback = async (event) => {
  try {
    const feedbackData = JSON.parse(event.body);
    const feedback = await feedbackService.createFeedback(feedbackData);
    return responseHelper.success(201, feedback);
  } catch (error) {
    console.error("Error in createFeedback controller:", error);
    return responseHelper.error(400, "Error creating feedback", error.message);
  }
};

exports.getFeedback = async (event) => {
  try {
    const { id } = event.pathParameters;
    const feedback = await feedbackService.getFeedback(id);
    return responseHelper.success(200, feedback);
  } catch (error) {
    console.error("Error in getFeedback controller:", error);
    return responseHelper.error(404, "Feedback not found", error.message);
  }
};
