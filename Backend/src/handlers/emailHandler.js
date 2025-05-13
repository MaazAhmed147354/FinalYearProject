"use strict";

require("dotenv").config();

const emailRoutes = require("./../routes/emailRoutes");
const emailService = require("../services/emailService");
const responseHelper = require("../utils/responseHelper");
const { Email, Job, Candidate, Resume } = require("../models");
const resumeService = require("../services/resumeService");
const fs = require("fs");
const path = require("path");

// Export existing route handlers
module.exports.syncEmails = emailRoutes.syncEmails;
module.exports.listEmails = emailRoutes.listEmails;
module.exports.sendEmail = emailRoutes.sendEmail;
module.exports.associateEmailWithJob = emailRoutes.associateEmailWithJob;
module.exports.updateEmailStatus = emailRoutes.updateEmailStatus;

/**
 * Extract resume from email attachment and process it
 * @param {Object} event - API Gateway Lambda event
 * @returns {Promise<Object>} API response
 */
module.exports.extractResumeFromEmail = async (event) => {
  try {
    console.log("Starting resume extraction from email");
    const { email_id, job_id } = JSON.parse(event.body);
   
    if (!email_id || !job_id) {
      return responseHelper.validationErrorResponse({
        email_id: "Email ID is required",
        job_id: "Job ID is required"
      });
    }

    // Get email
    const email = await Email.findByPk(email_id);
    console.log("Email found:", email ? "Yes" : "No");
    if (!email) {
      throw new Error("Email not found");
    }

    console.log("Email has_resume flag:", email.has_resume);
    console.log("Email attachment_paths:", email.attachment_paths);
   
    if (!email.has_resume) {
      throw new Error("Email does not have attachments");
    }

    // Get attachment paths with better error handling
    let attachmentPaths = [];
    try {
      attachmentPaths = JSON.parse(email.attachment_paths || "[]");
      console.log("Parsed attachment paths:", attachmentPaths);
    } catch (error) {
      console.error("Error parsing attachment_paths:", error);
      throw new Error("Error parsing attachment paths");
    }

    if (attachmentPaths.length === 0) {
      throw new Error("No attachments found");
    }

    // Check if files exist with more detailed logging
    for (const filePath of attachmentPaths) {
      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        console.log(`File ${filePath} exists and is accessible`);
      } catch (err) {
        console.error(`File access error for ${filePath}:`, err);
        throw new Error(`File not accessible: ${filePath}`);
      }
    }

    // Get only resume-like attachments (.pdf, .doc, .docx)
    const resumeAttachments = attachmentPaths.filter((path) =>
      /\.(pdf|doc|docx)$/i.test(path)
    );

    if (resumeAttachments.length === 0) {
      throw new Error("No resume attachments found");
    }

    // Log file sizes to help with debugging
    for (const resumePath of resumeAttachments) {
      try {
        const stats = await fs.promises.stat(resumePath);
        console.log(`Resume file size: ${stats.size} bytes for ${resumePath}`);
        
        // Warn about large files
        if (stats.size > 5_000_000) {
          console.warn(`Large resume file detected (${stats.size} bytes) - may cause timeout`);
        }
      } catch (err) {
        console.error(`Error checking file size: ${err.message}`);
      }
    }

    // Extract name and email from the sender field
    const nameMatch = email.sender.match(/^"?(([^"<]+)"?\s*<([^>]+)>|([^<]+))/);
    console.log("Name extraction match:", nameMatch);
   
    const candidateName = nameMatch ? (nameMatch[2] || nameMatch[4]).trim() : "Unknown";
    const candidateEmail = nameMatch ? (nameMatch[3] || email.sender).trim() : email.sender;

    // Process the first resume attachment
    const resumePath = resumeAttachments[0];
   
    try {
      console.log(`Reading file from path: ${resumePath}`);
      const fileData = await fs.promises.readFile(resumePath);
      console.log(`Successfully read ${fileData.length} bytes from file`);
      
      const file = {
        originalname: path.basename(resumePath),
        path: resumePath,
        data: fileData
      };

      // Upload resume with metadata
      const resumeData = {
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        job_id: job_id,
        source_email_id: email_id,
      };

      console.log("Sending to resumeService.uploadResume with candidate info:", 
        { name: candidateName, email: candidateEmail });

      try {
        // Set timeout protection
        const uploadTimeoutMs = 270000; // 4.5 minutes
        const uploadTimeout = setTimeout(() => {
          console.error("Resume upload operation timed out after 4.5 minutes");
        }, uploadTimeoutMs);
        
        // Upload resume with timeout protection
        const resume = await Promise.race([
          resumeService.uploadResume(resumeData, file),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Resume processing timeout")), uploadTimeoutMs)
          )
        ]);
        
        clearTimeout(uploadTimeout);
        
        // Update email status on success
        await email.update({
          status: "imported",
          job_id: job_id,
        });

        return responseHelper.successResponse(200, "Resume extracted successfully", resume);
      } catch (uploadError) {
        console.error("Error in resume upload:", uploadError);
        
        // Check error types and provide specific responses
        if (uploadError.message && (
            uploadError.message.includes('timeout') || 
            uploadError.message.includes('ECONNABORTED') ||
            uploadError.message.includes('504')
        )) {
          return responseHelper.errorResponse(408, "Resume parsing timed out", 
            "The PDF processing took too long. Try converting to a simpler PDF format or extracting text.");
        }
        
        // Check for Python service connectivity issues
        if (uploadError.code === 'ECONNREFUSED') {
          return responseHelper.errorResponse(503, "Resume parsing service unavailable",
            "The resume parsing service is currently unavailable. Please try again later.");
        }
        
        throw uploadError;
      }
    } catch (fileError) {
      console.error("Error processing resume file:", fileError);
      throw new Error(`Error processing resume: ${fileError.message}`);
    }
  } catch (error) {
    console.error("Error in extractResumeFromEmail:", error);
   
    if (error.message.includes('not found')) {
      return responseHelper.notFoundResponse(error.message.includes('Email') ? 'Email' : 'Job');
    }
    
    if (error.message.includes('parsing attachment paths')) {
      return responseHelper.errorResponse(400, "Failed to extract resume", 
        "Invalid attachment data in email");
    }
    
    if (error.message.includes('not accessible')) {
      return responseHelper.errorResponse(404, "Failed to extract resume", 
        "Attachment file could not be accessed");
    }
   
    return responseHelper.errorResponse(500, "Failed to extract resume", error.message);
  }
};