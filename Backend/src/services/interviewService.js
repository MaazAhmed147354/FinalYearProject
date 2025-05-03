"use strict";

const { Interview, InterviewParticipant, Resume, Candidate, User, Job } = require('../models');
const { Op } = require('sequelize');
const { emailService } = require('./emailService');

/**
 * Schedule a new interview
 * @param {Object} interviewData - Interview data
 * @returns {Promise<Object>} Created interview
 */
exports.scheduleInterview = async (interviewData) => {
  try {
    // Validate required data
    if (!interviewData.resume_id || !interviewData.job_id || !interviewData.date || !interviewData.time) {
      throw new Error('Missing required fields');
    }

    // Check if resume exists
    const resume = await Resume.findByPk(interviewData.resume_id, {
      include: [
        {
          model: Candidate,
          as: 'candidate'
        }
      ]
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Check if job exists
    const job = await Job.findByPk(interviewData.job_id);

    if (!job) {
      throw new Error('Job not found');
    }

    // Start a transaction to ensure all records are created
    const result = await Interview.sequelize.transaction(async (t) => {
      // Create interview
      const interview = await Interview.create({
        resume_id: interviewData.resume_id,
        job_id: interviewData.job_id,
        date: interviewData.date,
        time: interviewData.time,
        duration: interviewData.duration || 60,
        status: interviewData.status || 'pending',
        location: interviewData.location,
        meeting_link: interviewData.meeting_link,
        notes: interviewData.notes
      }, { transaction: t });

      // Add interviewers
      if (interviewData.interviewers && Array.isArray(interviewData.interviewers)) {
        for (const interviewer of interviewData.interviewers) {
          await InterviewParticipant.create({
            interview_id: interview.id,
            user_id: interviewer.user_id,
            role: interviewer.role || 'Interviewer'
          }, { transaction: t });
        }
      }

      return interview;
    });

    // Get complete interview with participants
    const interview = await Interview.findByPk(result.id, {
      include: [
        {
          model: InterviewParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            }
          ]
        },
        {
          model: Job,
          as: 'job'
        }
      ]
    });

    // Change resume status to shortlisted if it's not already
    if (resume.status === 'pending') {
      await resume.update({ status: 'shortlisted' });
    }

    // Send notification emails (if required)
    if (interviewData.sendNotifications) {
      await sendInterviewNotifications(interview);
    }

    return interview;
  } catch (error) {
    throw error;
  }
};

/**
 * List interviews with optional filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of interviews
 */
exports.listInterviews = async (filters = {}) => {
  try {
    // Build where clause from filters
    const whereClause = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.job_id) {
      whereClause.job_id = filters.job_id;
    }
    
    if (filters.date) {
      whereClause.date = filters.date;
    }
    
    if (filters.from_date && filters.to_date) {
      whereClause.date = {
        [Op.between]: [filters.from_date, filters.to_date]
      };
    } else if (filters.from_date) {
      whereClause.date = {
        [Op.gte]: filters.from_date
      };
    } else if (filters.to_date) {
      whereClause.date = {
        [Op.lte]: filters.to_date
      };
    }
    
    // Get interviews with related data
    const interviews = await Interview.findAll({
      where: whereClause,
      include: [
        {
          model: InterviewParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'department']
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    
    return interviews;
  } catch (error) {
    throw error;
  }
};

/**
 * Get interview details by ID
 * @param {number} id - Interview ID
 * @returns {Promise<Object>} Interview details
 */
exports.getInterviewDetails = async (id) => {
  try {
    const interview = await Interview.findByPk(id, {
      include: [
        {
          model: InterviewParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            }
          ]
        },
        {
          model: Job,
          as: 'job'
        }
      ]
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    return interview;
  } catch (error) {
    throw error;
  }
};

/**
 * Update interview details
 * @param {number} id - Interview ID
 * @param {Object} interviewData - Updated interview data
 * @returns {Promise<Object>} Updated interview
 */
exports.updateInterview = async (id, interviewData) => {
  try {
    // Get interview
    const interview = await Interview.findByPk(id);

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Start a transaction to ensure all records are updated
    const result = await Interview.sequelize.transaction(async (t) => {
      // Update interview
      await interview.update({
        date: interviewData.date || interview.date,
        time: interviewData.time || interview.time,
        duration: interviewData.duration || interview.duration,
        status: interviewData.status || interview.status,
        location: interviewData.location,
        meeting_link: interviewData.meeting_link,
        notes: interviewData.notes
      }, { transaction: t });

      // Update interviewers if provided
      if (interviewData.interviewers && Array.isArray(interviewData.interviewers)) {
        // Remove existing interviewers
        await InterviewParticipant.destroy({
          where: { interview_id: id },
          transaction: t
        });

        // Add new interviewers
        for (const interviewer of interviewData.interviewers) {
          await InterviewParticipant.create({
            interview_id: id,
            user_id: interviewer.user_id,
            role: interviewer.role || 'Interviewer'
          }, { transaction: t });
        }
      }

      return interview;
    });

    // Get updated interview with participants
    const updatedInterview = await Interview.findByPk(id, {
      include: [
        {
          model: InterviewParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            }
          ]
        },
        {
          model: Job,
          as: 'job'
        }
      ]
    });

    // Send notification about changes if required
    if (interviewData.sendNotifications) {
      await sendInterviewUpdateNotifications(updatedInterview);
    }

    return updatedInterview;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an interview
 * @param {number} id - Interview ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancelled interview
 */
exports.cancelInterview = async (id, reason) => {
  try {
    // Get interview
    const interview = await Interview.findByPk(id, {
      include: [
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            }
          ]
        },
        {
          model: InterviewParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Update interview status
    await interview.update({
      status: 'cancelled',
      notes: reason ? `${interview.notes || ''}\n\nCancellation reason: ${reason}`.trim() : interview.notes
    });

    // Send cancellation notifications
    await sendCancellationNotifications(interview, reason);

    return interview;
  } catch (error) {
    throw error;
  }
};

/**
 * Complete an interview
 * @param {number} id - Interview ID
 * @param {Object} feedback - Interview feedback
 * @returns {Promise<Object>} Completed interview
 */
exports.completeInterview = async (id, feedback) => {
  try {
    // Get interview
    const interview = await Interview.findByPk(id);

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Update interview
    await interview.update({
      status: 'completed',
      notes: feedback ? `${interview.notes || ''}\n\nFeedback: ${feedback.notes}`.trim() : interview.notes
    });

    // Further processing of feedback (e.g., save to a feedback table)
    // This would depend on your specific requirements

    return interview;
  } catch (error) {
    throw error;
  }
};

/**
 * Find available interview slots
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} Available slots
 */
exports.findAvailableSlots = async (params) => {
  try {
    const { date, interviewers, duration = 60 } = params;
    
    if (!date || !interviewers || !Array.isArray(interviewers) || interviewers.length === 0) {
      throw new Error('Missing required parameters');
    }
    
    // Define working hours (9:00 - 17:00)
    const startHour = 9;
    const endHour = 17;
    
    // Get all interviews for the given date and interviewers
    const existingInterviews = await Interview.findAll({
      where: {
        date,
        status: { [Op.ne]: 'cancelled' }
      },
      include: [
        {
          model: InterviewParticipant,
          as: 'participants',
          where: {
            user_id: { [Op.in]: interviewers }
          }
        }
      ]
    });
    
    // Convert to busy time slots
    const busySlots = existingInterviews.map(interview => {
      const startTime = interview.time.split(':').map(Number);
      const start = startTime[0] * 60 + startTime[1]; // minutes since 00:00
      const end = start + interview.duration;
      
      return { start, end };
    });
    
    // Find available slots
    const availableSlots = [];
    const slotInterval = 30; // 30-minute intervals
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotStart = hour * 60 + minute;
        const slotEnd = slotStart + duration;
        
        // Skip if slot extends beyond working hours
        if (slotEnd > endHour * 60) continue;
        
        // Check if slot overlaps with any busy slot
        const isOverlapping = busySlots.some(busySlot => {
          return (slotStart < busySlot.end && slotEnd > busySlot.start);
        });
        
        if (!isOverlapping) {
          const formattedHour = hour.toString().padStart(2, '0');
          const formattedMinute = minute.toString().padStart(2, '0');
          
          availableSlots.push(`${formattedHour}:${formattedMinute}`);
        }
      }
    }
    
    return availableSlots;
  } catch (error) {
    throw error;
  }
};

/**
 * Send interview notifications
 * @param {Object} interview - Interview with related data
 * @returns {Promise<void>}
 */
const sendInterviewNotifications = async (interview) => {
  try {
    const candidate = interview.resume.candidate;
    const job = interview.job;
    const date = new Date(interview.date).toLocaleDateString();
    const time = interview.time;
    
    // Prepare email to candidate
    const candidateEmail = {
      candidate_id: candidate.id,
      subject: `Interview Scheduled: ${job.title}`,
      body: `
        <p>Dear ${candidate.name},</p>
        <p>We are pleased to invite you for an interview for the position of ${job.title}.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Duration:</strong> ${interview.duration} minutes</p>
        ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
        ${interview.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">${interview.meeting_link}</a></p>` : ''}
        <p>Please confirm your availability by replying to this email.</p>
        <p>Best regards,<br>Recruitment Team</p>
      `
    };
    
    // Send email to candidate
    await emailService.sendEmail(candidateEmail);
    
    // Prepare emails to interviewers
    for (const participant of interview.participants) {
      const interviewer = participant.user;
      
      const interviewerEmail = {
        to: interviewer.email,
        subject: `Interview Scheduled: ${candidate.name} for ${job.title}`,
        body: `
          <p>Dear ${interviewer.name},</p>
          <p>You have been assigned to interview ${candidate.name} for the position of ${job.title}.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Duration:</strong> ${interview.duration} minutes</p>
          ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
          ${interview.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">${interview.meeting_link}</a></p>` : ''}
          <p>Please let us know if you have any conflicts or concerns.</p>
          <p>Best regards,<br>Recruitment Team</p>
        `
      };
      
      // Send email to interviewer
      // This would depend on your specific email sending implementation
      // For now, we'll just log it
      console.log(`Would send email to interviewer ${interviewer.email}`);
    }
  } catch (error) {
    console.error('Error sending interview notifications:', error);
    // Continue without throwing, as this is a non-critical operation
  }
};

/**
 * Send interview update notifications
 * @param {Object} interview - Updated interview with related data
 * @returns {Promise<void>}
 */
const sendInterviewUpdateNotifications = async (interview) => {
  try {
    const candidate = interview.resume.candidate;
    const job = interview.job;
    const date = new Date(interview.date).toLocaleDateString();
    const time = interview.time;
    
    // Prepare email to candidate
    const candidateEmail = {
      candidate_id: candidate.id,
      subject: `Interview Updated: ${job.title}`,
      body: `
        <p>Dear ${candidate.name},</p>
        <p>Your interview for the position of ${job.title} has been updated.</p>
        <p><strong>New Date:</strong> ${date}</p>
        <p><strong>New Time:</strong> ${time}</p>
        <p><strong>Duration:</strong> ${interview.duration} minutes</p>
        ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
        ${interview.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">${interview.meeting_link}</a></p>` : ''}
        <p>Please confirm your availability for the updated schedule.</p>
        <p>Best regards,<br>Recruitment Team</p>
      `
    };
    
    // Send email to candidate
    await emailService.sendEmail(candidateEmail);
    
    // Similarly, send emails to interviewers (omitted for brevity)
  } catch (error) {
    console.error('Error sending interview update notifications:', error);
    // Continue without throwing, as this is a non-critical operation
  }
};

/**
 * Send interview cancellation notifications
 * @param {Object} interview - Cancelled interview with related data
 * @param {string} reason - Cancellation reason
 * @returns {Promise<void>}
 */
const sendCancellationNotifications = async (interview, reason) => {
  try {
    const candidate = interview.resume.candidate;
    const job = interview.job;
    const date = new Date(interview.date).toLocaleDateString();
    const time = interview.time;
    
    // Prepare email to candidate
    const candidateEmail = {
      candidate_id: candidate.id,
      subject: `Interview Cancelled: ${job.title}`,
      body: `
        <p>Dear ${candidate.name},</p>
        <p>We regret to inform you that your interview for the position of ${job.title} has been cancelled.</p>
        <p><strong>Originally Scheduled:</strong> ${date} at ${time}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>We will contact you shortly to reschedule the interview.</p>
        <p>We apologize for any inconvenience caused.</p>
        <p>Best regards,<br>Recruitment Team</p>
      `
    };
    
    // Send email to candidate
    await emailService.sendEmail(candidateEmail);
    
    // Similarly, send emails to interviewers (omitted for brevity)
  } catch (error) {
    console.error('Error sending cancellation notifications:', error);
    // Continue without throwing, as this is a non-critical operation
  }
};
