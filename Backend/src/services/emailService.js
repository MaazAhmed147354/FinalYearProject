"use strict";

const { Email, Job, Candidate, Resume } = require("../models");
const { Op } = require("sequelize");
// const { Imap, simpleParser } = require('imap-simple');
const Imap = require("imap-simple");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");
const resumeService = require("./resumeService");

/**
 * Synchronize emails from configured mailbox
 * @param {Object} config - Email configuration
 * @returns {Promise<Object>} Synchronization results
 */
exports.syncEmails = async (config) => {
  try {
    // Default configuration
    const defaultConfig = {
      imap: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        tls: process.env.EMAIL_TLS === "true",
        authTimeout: 30000,
        tlsOptions: {
          rejectUnauthorized: false, // Add this line to allow self-signed certificates
        },
      },
      searchCriteria: ["UNSEEN"],
      fetchOptions: {
        bodies: ["HEADER", "TEXT", ""],
        markSeen: true,
        struct: true,
      },
    };

    // Merge with provided config
    const emailConfig = {
      ...defaultConfig,
      ...config,
    };

    // Connect to mail server
    const connection = await Imap.connect(emailConfig);
    console.log("Successfully connected to email server");

    // Open inbox
    await connection.openBox("INBOX");
    console.log("Successfully opened inbox");

    console.log("Search criteria:", emailConfig.searchCriteria);
    // Search for emails matching criteria
    const results = await connection.search(
      emailConfig.searchCriteria,
      emailConfig.fetchOptions
    );
    console.log("Found emails count:", results.length);

    // Process emails
    const emails = [];

    for (const result of results) {
      const all = _.find(result.parts, { which: "" });
      const id = result.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";

      // Parse the email with better error handling
      let emailObj = await simpleParser(idHeader + all.body);

      // Log the parsed email object for debugging
      console.log(
        "Parsed email object:",
        JSON.stringify({
          from: emailObj.from,
          subject: emailObj.subject,
          date: emailObj.date,
          hasAttachments: !!(
            emailObj.attachments && emailObj.attachments.length
          ),
        })
      );

      // Extract sender properly
      let sender = "Unknown Sender";
      if (
        emailObj.from &&
        emailObj.from.value &&
        emailObj.from.value.length > 0
      ) {
        sender = emailObj.from.value[0].address;
        if (emailObj.from.value[0].name) {
          sender = `${emailObj.from.value[0].name} <${sender}>`;
        }
      }

      // Create email record with safe values
      const email = await Email.create({
        sender: sender,
        subject: emailObj.subject || "No Subject",
        body: emailObj.text || emailObj.html || "",
        received_date: emailObj.date || new Date(),
        has_resume: !!(emailObj.attachments && emailObj.attachments.length > 0),
        status: "pending",
      });

      // Save attachments
      // Inside the syncEmails function, find the part that processes attachments
      if (email.has_resume) {
        const uploadDir = path.join(__dirname, "../../uploads/attachments");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        console.log("Upload directory created:", uploadDir);

        // Initialize attachment paths array
        const attachmentPaths = [];

        for (const attachment of emailObj.attachments) {
          const fileName = `${uuidv4()}_${attachment.filename.replace(
            /\s+/g,
            "_"
          )}`;
          const filePath = path.join(uploadDir, fileName);

          // Save attachment
          await fs.promises.writeFile(filePath, attachment.content);
          console.log("Saved attachment to:", filePath);

          // Add attachment path to array
          attachmentPaths.push(filePath);
        }

        // Update email with attachment paths - IMPORTANT FIX
        if (attachmentPaths.length > 0) {
          const pathsJson = JSON.stringify(attachmentPaths);
          console.log("Updating email with paths:", pathsJson);
          await email.update({ attachment_paths: pathsJson });

          // Verify the update was successful
          const updatedEmail = await Email.findByPk(email.id);
          console.log(
            "Attachment paths after update:",
            updatedEmail.attachment_paths
          );
        }
      }

      emails.push(email);
    }

    // Close connection
    connection.end();

    return {
      success: true,
      emails_synced: emails.length,
      emails: emails,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * List emails with optional filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of emails
 */
exports.listEmails = async (filters = {}) => {
  try {
    // Build where clause from filters
    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.has_resume !== undefined) {
      whereClause.has_resume = filters.has_resume;
    }

    if (filters.job_id) {
      whereClause.job_id = filters.job_id;
    }

    if (filters.start_date && filters.end_date) {
      whereClause.received_date = {
        [Op.between]: [filters.start_date, filters.end_date],
      };
    } else if (filters.start_date) {
      whereClause.received_date = {
        [Op.gte]: filters.start_date,
      };
    } else if (filters.end_date) {
      whereClause.received_date = {
        [Op.lte]: filters.end_date,
      };
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { sender: { [Op.like]: `%${filters.search}%` } },
        { subject: { [Op.like]: `%${filters.search}%` } },
        { body: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    // Get emails
    const emails = await Email.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title"],
        },
      ],
      order: [["received_date", "DESC"]],
    });

    return emails;
  } catch (error) {
    throw error;
  }
};

/**
 * Extract resume from email attachment
 * @param {number} emailId - Email ID
 * @param {number} jobId - Job ID to associate with the resume
 * @returns {Promise<Object>} Extracted resume data
 */
exports.extractResumeFromEmail = async (emailId, jobId) => {
  try {
    console.log(
      `Starting extract resume for emailId: ${emailId}, jobId: ${jobId}`
    );

    // Get email
    const email = await Email.findByPk(emailId);
    console.log("Email found:", email ? "Yes" : "No");

    if (!email) {
      throw new Error("Email not found");
    }

    console.log("Email has_resume flag:", email.has_resume);
    console.log("Email attachment_paths:", email.attachment_paths);

    if (!email.has_resume) {
      throw new Error("Email does not have attachments");
    }

    // Get attachment paths
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

    // Check if files exist
    for (const path of attachmentPaths) {
      const exists = await fs.promises
        .access(path)
        .then(() => true)
        .catch(() => false);
      console.log(`File ${path} exists: ${exists}`);
    }

    // Get only resume-like attachments (.pdf, .doc, .docx)
    const resumeAttachments = attachmentPaths.filter((path) =>
      /\.(pdf|doc|docx)$/i.test(path)
    );

    if (resumeAttachments.length === 0) {
      throw new Error("No resume attachments found");
    }

    // Extract name and email from the sender field
    const nameMatch = email.sender.match(/^"?([^"<]+)"?\s*<?([^>]+)>?$/);
    console.log(nameMatch);
    
    const candidateName = nameMatch ? nameMatch[1].trim() : "Unknown";
    const candidateEmail = nameMatch ? nameMatch[2].trim() : email.sender;

    // Process the first resume attachment
    const resumePath = resumeAttachments[0];
    const file = {
      originalname: path.basename(resumePath),
      path: resumePath,
      data: await fs.promises.readFile(resumePath),
    };

    // Upload resume
    const resumeData = {
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      job_id: jobId,
      source_email_id: emailId,
    };

    const resume = await resumeService.uploadResume(resumeData, file);

    // Update email status
    await email.update({
      status: "imported",
      job_id: jobId,
    });

    return resume;
  } catch (error) {
    throw error;
  }
};

/**
 * Send email to a candidate
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} Send result
 */
exports.sendEmail = async (emailData) => {
  try {
    // Get candidate
    const candidate = await Candidate.findByPk(emailData.candidate_id);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Create transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: candidate.email,
      subject: emailData.subject,
      html: emailData.body,
      attachments: emailData.attachments || [],
    });

    return {
      success: true,
      message_id: result.messageId,
      recipient: candidate.email,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Associate email with job
 * @param {number} emailId - Email ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Updated email
 */
exports.associateEmailWithJob = async (emailId, jobId) => {
  try {
    // Get email
    const email = await Email.findByPk(emailId);

    if (!email) {
      throw new Error("Email not found");
    }

    // Get job
    const job = await Job.findByPk(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    // Update email
    await email.update({ job_id: jobId });

    return email;
  } catch (error) {
    throw error;
  }
};

/**
 * Update email status
 * @param {number} emailId - Email ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated email
 */
exports.updateEmailStatus = async (emailId, status) => {
  try {
    // Get email
    const email = await Email.findByPk(emailId);

    if (!email) {
      throw new Error("Email not found");
    }

    if (!["pending", "imported", "rejected", "spam"].includes(status)) {
      throw new Error("Invalid status");
    }

    // Update email
    await email.update({ status });

    return email;
  } catch (error) {
    throw error;
  }
};

/**
 * Get email details by ID
 * @param {number} id - Email ID
 * @returns {Promise<Object>} Email details
 */
exports.getEmailDetails = async (id) => {
  try {
    // Get email with job information
    const email = await Email.findByPk(id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'department', 'status'],
        },
      ],
    });

    if (!email) {
      throw new Error('Email not found');
    }

    return email;
  } catch (error) {
    throw error;
  }
};
