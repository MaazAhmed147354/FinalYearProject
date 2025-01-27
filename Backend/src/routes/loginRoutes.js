const loginController = require('./../controllers/loginController');

module.exports.loginUser = async (event) => {
    return await loginController.loginUser(event);
};