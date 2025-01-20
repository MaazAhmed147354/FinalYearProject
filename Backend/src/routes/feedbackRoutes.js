const feedbackController = require("../controllers/feedbackController");

module.exports.createFeedback = async (event) => {
  return await feedbackController.createFeedback(event);
};

module.exports.getFeedback = async (event) => {
  return await feedbackController.getFeedback(event);
};
