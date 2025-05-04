const emailController = require("../controllers/emailController");
const auth = require("../middlewares/authMiddleware");

// Synchronize emails
module.exports.syncEmails = async (event) => {
  const authResult = await auth.authorizeToken(event, ["admin", "hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.syncEmails(event);
};

// List emails
module.exports.listEmails = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.listEmails(event);
};

// Extract resume from email
module.exports.extractResumeFromEmail = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.extractResumeFromEmail(event);
};

// Send email to candidate
module.exports.sendEmail = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr", "recruiter"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.sendEmail(event);
};

// Associate email with job
module.exports.associateEmailWithJob = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.associateEmailWithJob(event);
};

// Update email status
module.exports.updateEmailStatus = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.updateEmailStatus(event);
};
