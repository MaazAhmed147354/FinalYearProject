const analyticsController = require("../controllers/analyticsController");

module.exports.getJobAnalytics = async (event) => {
  return await analyticsController.getJobAnalytics(event);
};

module.exports.getResumeAnalytics = async (event) => {
  return await analyticsController.getResumeAnalytics(event);
};

module.exports.getInterviewAnalytics = async (event) => {
  return await analyticsController.getInterviewAnalytics(event);
};
