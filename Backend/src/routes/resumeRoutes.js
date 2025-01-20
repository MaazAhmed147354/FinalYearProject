const resumeController = require("./../controllers/resumeController");

module.exports.uploadResume = async (event) => {
  return await resumeController.uploadResume(event);
};

module.exports.listResumes = async (event) => {
  return await resumeController.listResumes(event);
};

module.exports.getResumeDetails = async (event) => {
  return await resumeController.getResumeDetails(event);
};

module.exports.updateResumeStatus = async (event) => {
  return await resumeController.updateResumeStatus(event);
};
