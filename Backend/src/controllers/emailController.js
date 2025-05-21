const emailService = require("../services/emailService");
const responseHelper = require("../utils/responseHelper");

/**
 * Synchronize emails from configured mailbox
 */
exports.syncEmails = async (event) => {
  try {
    const config = event.body ? JSON.parse(event.body) : {};
    const result = await emailService.syncEmails(config);
    return responseHelper.successResponse(
      200,
      "Emails synchronized successfully",
      result
    );
  } catch (error) {
    console.error("Error in syncEmails:", error);
    return responseHelper.errorResponse(
      500,
      "Failed to sync emails",
      error.message
    );
  }
};

/**
 * List emails with optional filters
 */
exports.listEmails = async (event) => {
  try {
    const filters = event.queryStringParameters || {};
    const emails = await emailService.listEmails(filters);
    return responseHelper.successResponse(
      200,
      "Emails retrieved successfully",
      emails
    );
  } catch (error) {
    console.error("Error in listEmails:", error);
    return responseHelper.errorResponse(
      500,
      "Failed to retrieve emails",
      error.message
    );
  }
};

/**
 * Send email to a candidate
 */
exports.sendEmail = async (event) => {
  try {
    const emailData = JSON.parse(event.body);

    if (!emailData.candidate_id || !emailData.subject || !emailData.body) {
      return responseHelper.validationErrorResponse({
        candidate_id: "Candidate ID is required",
        subject: "Subject is required",
        body: "Body is required",
      });
    }

    const result = await emailService.sendEmail(emailData);
    return responseHelper.successResponse(
      200,
      "Email sent successfully",
      result
    );
  } catch (error) {
    console.error("Error in sendEmail:", error);

    if (error.message === "Candidate not found") {
      return responseHelper.notFoundResponse("Candidate");
    }

    return responseHelper.errorResponse(
      500,
      "Failed to send email",
      error.message
    );
  }
};

/**
 * Associate email with job
 */
exports.associateEmailWithJob = async (event) => {
  try {
    const { email_id, job_id } = JSON.parse(event.body);

    if (!email_id || !job_id) {
      return responseHelper.validationErrorResponse({
        email_id: "Email ID is required",
        job_id: "Job ID is required",
      });
    }

    const email = await emailService.associateEmailWithJob(email_id, job_id);
    return responseHelper.successResponse(
      200,
      "Email associated with job successfully",
      email
    );
  } catch (error) {
    console.error("Error in associateEmailWithJob:", error);

    if (error.message.includes("not found")) {
      return responseHelper.notFoundResponse(
        error.message.includes("Email") ? "Email" : "Job"
      );
    }

    return responseHelper.errorResponse(
      500,
      "Failed to associate email with job",
      error.message
    );
  }
};

/**
 * Update email status
 */
exports.updateEmailStatus = async (event) => {
  try {
    const { email_id, status } = JSON.parse(event.body);

    if (!email_id || !status) {
      return responseHelper.validationErrorResponse({
        email_id: "Email ID is required",
        status: "Status is required",
      });
    }

    const email = await emailService.updateEmailStatus(email_id, status);
    return responseHelper.successResponse(
      200,
      "Email status updated successfully",
      email
    );
  } catch (error) {
    console.error("Error in updateEmailStatus:", error);

    if (error.message === "Email not found") {
      return responseHelper.notFoundResponse("Email");
    }

    if (error.message === "Invalid status") {
      return responseHelper.validationErrorResponse({
        status: "Must be one of: pending, imported, rejected, spam",
      });
    }

    return responseHelper.errorResponse(
      500,
      "Failed to update email status",
      error.message
    );
  }
};

/**
 * Get email details
 */
exports.getEmailDetails = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return responseHelper.validationErrorResponse({
        id: "Email ID is required",
      });
    }

    const email = await emailService.getEmailDetails(id);
    return responseHelper.successResponse(
      200,
      "Email details retrieved successfully",
      email
    );
  } catch (error) {
    console.error("Error in getEmailDetails:", error);

    if (error.message === "Email not found") {
      return responseHelper.notFoundResponse("Email");
    }

    return responseHelper.errorResponse(
      500,
      "Failed to retrieve email details",
      error.message
    );
  }
};

/**
 * Download email attachment
 */
exports.downloadEmailAttachment = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return responseHelper.validationErrorResponse({
        id: "Email ID is required",
      });
    }

    const result = await emailService.getEmailDetails(id);
    if (!result.attachment_paths || result.attachment_paths.length === 0) {
      return responseHelper.errorResponse(
        404,
        "No attachments found for this email"
      );
    }
    // For now, just return the first attachment's path (actual file reading should be in service if needed)
    return responseHelper.successResponse(200, "Attachment path retrieved", {
      path: result.attachment_paths[0],
    });
  } catch (error) {
    console.error("Error in downloadEmailAttachment:", error);
    if (error.message === "Email not found") {
      return responseHelper.notFoundResponse("Email");
    }
    return responseHelper.errorResponse(
      500,
      "Failed to download attachment",
      error.message
    );
  }
};

/**
 * Extract resumes from all emails associated with a given job ID
 */
exports.extractResumesFromJob = async (event) => {
  try {
    const { job_id } = JSON.parse(event.body);

    if (!job_id) {
      return responseHelper.validationErrorResponse({
        job_id: "Job ID is required",
      });
    }

    await emailService.extractResumesFromJob(job_id);
    return responseHelper.successResponse(
      200,
      "Resumes extraction process initiated successfully"
    );
  } catch (error) {
    console.error("Error in extractResumesFromJob:", error);
    return responseHelper.errorResponse(
      500,
      "Failed to initiate resume extraction",
      error.message
    );
  }
};
