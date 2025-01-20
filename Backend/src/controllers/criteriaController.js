const criteriaService = require("../services/criteriaService");
const responseHelper = require("../utils/responseHelper");

// Create custom shortlisting criteria
exports.createCriteria = async (event) => {
  try {
    const criteriaData = JSON.parse(event.body);
    const criteria = await criteriaService.createCriteria(criteriaData);
    return responseHelper.success(201, "Criteria created successfully!", criteria);
  } catch (error) {
    console.error("Error in createCriteria controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// Get criteria for a specific job
exports.getCriteria = async (event) => {
  try {
    const job_id = event.pathParameters.job_id;
    const criteria = await criteriaService.getCriteria(job_id);
    return responseHelper.success(200, "Criteria retrieved successfully!", criteria);
  } catch (error) {
    console.error("Error in getCriteria controller:", error);
    return responseHelper.error(404, "Criteria not found", error.message);
  }
};

// Apply criteria to shortlist resumes
exports.applyShortlistingCriteria = async (event) => {
  try {
    const shortlistingData = JSON.parse(event.body);
    const shortlisted = await criteriaService.applyShortlistingCriteria(shortlistingData);
    return responseHelper.success(200, "Resumes shortlisted successfully!", shortlisted);
  } catch (error) {
    console.error("Error in applyShortlistingCriteria controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};
