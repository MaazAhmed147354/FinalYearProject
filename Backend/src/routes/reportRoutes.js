const reportController = require("./../controllers/reportController");

module.exports.generateCandidateReport = async (event) => {
  return await reportController.generateCandidateReport(event);
};

module.exports.compareCandidates = async (event) => {
  return await reportController.compareCandidates(event);
};
