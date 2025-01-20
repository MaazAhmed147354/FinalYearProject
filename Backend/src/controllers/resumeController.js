const resumeService = require("../services/resumeService");
const responseHelper = require("../utils/responseHelper");

// Upload a resume
exports.uploadResume = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const file = event.file; // Assuming the file is passed in the event
    const newResume = await resumeService.uploadResume(body, file);
    return responseHelper.success(201, "Resume uploaded successfully!", newResume);
  } catch (error) {
    console.error("Error in uploadResume controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// List all resumes
exports.listResumes = async (event) => {
  try {
    const filters = JSON.parse(event.body);
    const resumes = await resumeService.listResumes(filters);
    return responseHelper.success(200, "Resumes retrieved successfully!", resumes);
  } catch (error) {
    console.error("Error in listResumes controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};

// Get parsed resume details
exports.getResumeDetails = async (event) => {
  try {
    const id = event.pathParameters.id;
    const resume = await resumeService.getResumeDetails(id);
    return responseHelper.success(200, "Resume details retrieved successfully!", resume);
  } catch (error) {
    console.error("Error in getResumeDetails controller:", error);
    return responseHelper.error(404, "Resume not found", error.message);
  }
};

// Update resume status
exports.updateResumeStatus = async (event) => {
  try {
    const { id, status } = JSON.parse(event.body);
    const updatedResume = await resumeService.updateResumeStatus(id, status);
    return responseHelper.success(200, "Resume status updated successfully!", updatedResume);
  } catch (error) {
    console.error("Error in updateResumeStatus controller:", error);
    return responseHelper.error(500, "Internal Server Error", error.message);
  }
};
