const interviewController = require("./../controllers/interviewController");

module.exports.scheduleInterview = async (event) => {
  return await interviewController.scheduleInterview(event);
};

module.exports.listInterviews = async (event) => {
  return await interviewController.listInterviews(event);
};

module.exports.updateInterview = async (event) => {
  return await interviewController.updateInterview(event);
};
