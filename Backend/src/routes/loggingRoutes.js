const loginController = require('../controllers/loggingController');

module.exports.loginUser = async (event) => {
    return await loginController.loginUser(event);
};