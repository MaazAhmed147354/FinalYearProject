const loginController = require('./../contollers/loginController');

module.exports.loginUser = async (event) => {
    return await loginController.loginUser(event);
};