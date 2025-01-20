const jobService = require('../services/jobService');
const responseHelper = require("../utils/responseHelper");

exports.createJob = async (event) => {
  try {
    const jobData = JSON.parse(event.body);
    const job = await jobService.createJob(jobData);
    return responseHelper.success(201, job);
  } catch (error) {
    console.error("Error in createJob controller:", error);
    return responseHelper.error(400, "Error creating job", error.message);
  }
};

exports.listJobs = async (event) => {
  try {
    const filters = event.queryStringParameters || {};
    const jobs = await jobService.listJobs(filters);
    return responseHelper.success(200, jobs);
  } catch (error) {
    console.error("Error in listJobs controller:", error);
    return responseHelper.error(400, "Error listing jobs", error.message);
  }
};

exports.getJobDetails = async (event) => {
  try {
    const { id } = event.pathParameters;
    const job = await jobService.getJobDetails(id);
    return responseHelper.success(200, job);
  } catch (error) {
    console.error("Error in getJobDetails controller:", error);
    return responseHelper.error(404, "Job not found", error.message);
  }
};

exports.updateJob = async (event) => {
  try {
    const { id } = event.pathParameters;
    const jobData = JSON.parse(event.body);
    const job = await jobService.updateJob(id, jobData);
    return responseHelper.success(200, job);
  } catch (error) {
    console.error("Error in updateJob controller:", error);
    return responseHelper.error(404, "Error updating job", error.message);
  }
};

exports.deleteJob = async (event) => {
  try {
    const { id } = event.pathParameters;
    await jobService.deleteJob(id);
    return responseHelper.success(204);
  } catch (error) {
    console.error("Error in deleteJob controller:", error);
    return responseHelper.error(404, "Error deleting job", error.message);
  }
};
