const jobController = require("../controllers/jobController");

module.exports.createJob = async (event) => {
  return await jobController.createJob(event);
};

module.exports.listJobs = async (event) => {
  return await jobController.listJobs(event);
};

module.exports.getJobDetails = async (event) => {
  return await jobController.getJobDetails(event);
};

module.exports.updateJob = async (event) => {
  return await jobController.updateJob(event);
};

module.exports.deleteJob = async (event) => {
  return await jobController.deleteJob(event);
};
