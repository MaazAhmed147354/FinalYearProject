const reportService = require("../services/reportService");
const responseHelper = require("../utils/responseHelper");

// Generate a detailed report for a candidate
exports.generateCandidateReport = async (event) => {
  try {
    const { resume_id } = JSON.parse(event.body);
    const report = await reportService.generateCandidateReport(resume_id);
    return responseHelper.success(201, "Candidate report generated successfully!", report);
  } catch (error) {
    console.error("Error in generateCandidateReport controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// Compare multiple candidates side-by-side
exports.compareCandidates = async (event) => {
  try {
    const { resume_ids } = JSON.parse(event.body);
    const comparison = await reportService.compareCandidates(resume_ids);
    return responseHelper.success(200, "Candidates compared successfully!", comparison);
  } catch (error) {
    console.error("Error in compareCandidates controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};
