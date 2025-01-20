const interviewService = require("../services/interviewService");
const responseHelper = require("../utils/responseHelper");

// Schedule an interview
exports.scheduleInterview = async (event) => {
  try {
    const interviewData = JSON.parse(event.body);
    const interview = await interviewService.scheduleInterview(interviewData);
    return responseHelper.success(201, "Interview scheduled successfully!", interview);
  } catch (error) {
    console.error("Error in scheduleInterview controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// List all scheduled interviews
exports.listInterviews = async (event) => {
  try {
    const filters = JSON.parse(event.body);
    const interviews = await interviewService.listInterviews(filters);
    return responseHelper.success(200, "Interviews retrieved successfully!", interviews);
  } catch (error) {
    console.error("Error in listInterviews controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// Update interview details
exports.updateInterview = async (event) => {
  try {
    const { id, interviewData } = JSON.parse(event.body);
    const updatedInterview = await interviewService.updateInterview(id, interviewData);
    return responseHelper.success(200, "Interview details updated successfully!", updatedInterview);
  } catch (error) {
    console.error("Error in updateInterview controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};
