const emailController = require("../controllers/emailController");
const auth = require("../middlewares/authMiddleware");

// Synchronize emails
exports.syncEmails = async (event) => {
  const authResult = await auth.authorizeToken(event, ["admin", "hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.syncEmails(event);
};

// List emails
exports.listEmails = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.listEmails(event);
};

// Extract resume from Job
exports.extractResumesFromJob = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.extractResumesFromJob(event);
};

// Send email to candidate
exports.sendEmail = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr", "recruiter"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.sendEmail(event);
};

// Associate email with job
exports.associateEmailWithJob = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.associateEmailWithJob(event);
};

// Update email status
exports.updateEmailStatus = async (event) => {
  const authResult = await auth.authorizeToken(event, ["hr"]);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.updateEmailStatus(event);
};

// Get email details
exports.getEmailDetails = async (event) => {
  const authResult = await auth.authorizeToken(event);
  if (authResult.statusCode !== 202) return authResult;

  return await emailController.getEmailDetails(event);
};
