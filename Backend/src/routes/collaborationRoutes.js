const collaborationController = require("./../controllers/collaborationController");

module.exports.addComment = async (event) => {
  return await collaborationController.addComment(event);
};

module.exports.fetchNotifications = async (event) => {
  return await collaborationController.fetchNotifications(event);
};
