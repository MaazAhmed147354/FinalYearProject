const collaborationService = require("../services/collaborationService");
const responseHelper = require("../utils/responseHelper");

// Add a comment
exports.addComment = async (event) => {
  try {
    const commentData = JSON.parse(event.body);
    const comment = await collaborationService.addComment(commentData);
    return responseHelper.success(201, "Comment added successfully!", comment);
  } catch (error) {
    console.error("Error in addComment controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// Fetch notifications for a user
exports.fetchNotifications = async (event) => {
  try {
    const user_id = event.pathParameters.user_id;
    const notifications = await collaborationService.fetchNotifications(user_id);
    return responseHelper.success(200, "Notifications fetched successfully!", notifications);
  } catch (error) {
    console.error("Error in fetchNotifications controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};
