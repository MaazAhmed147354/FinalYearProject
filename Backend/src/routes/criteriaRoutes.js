const criteriaController = require("./../controllers/criteriaController");

module.exports.createCriteria = async (event) => {
  return await criteriaController.createCriteria(event);
};

module.exports.getCriteria = async (event) => {
  return await criteriaController.getCriteria(event);
};

module.exports.applyShortlistingCriteria = async (event) => {
  return await criteriaController.applyShortlistingCriteria(event);
};
