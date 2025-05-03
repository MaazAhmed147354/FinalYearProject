"use strict";

const { Job, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new job opening
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Created job
 */
exports.createJob = async (jobData) => {
  try {
    // Create job
    const job = await Job.create({
      title: jobData.title,
      description: jobData.description,
      department: jobData.department,
      required_skills: jobData.required_skills || [],
      qualifications: jobData.qualifications || '',
      experience: jobData.experience || '',
      start_date: jobData.start_date,
      end_date: jobData.end_date,
      status: 'open',
      created_by: jobData.created_by
    });

    return job;
  } catch (error) {
    throw error;
  }
};

/**
 * List jobs with optional filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of jobs
 */
exports.listJobs = async (filters = {}) => {
  try {
    // Build where clause from filters
    const whereClause = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.department) {
      whereClause.department = filters.department;
    }
    
    if (filters.title) {
      whereClause.title = { [Op.like]: `%${filters.title}%` };
    }
    
    if (filters.created_by) {
      whereClause.created_by = filters.created_by;
    }

    // Get jobs with user information
    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return jobs;
  } catch (error) {
    throw error;
  }
};

/**
 * Get job details by ID
 * @param {number} id - Job ID
 * @returns {Promise<Object>} Job details
 */
exports.getJobDetails = async (id) => {
  try {
    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  } catch (error) {
    throw error;
  }
};

/**
 * Update job details
 * @param {number} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} Updated job
 */
exports.updateJob = async (id, jobData) => {
  try {
    const job = await Job.findByPk(id);

    if (!job) {
      throw new Error('Job not found');
    }

    // Update job fields
    await job.update({
      title: jobData.title || job.title,
      description: jobData.description || job.description,
      department: jobData.department || job.department,
      required_skills: jobData.required_skills || job.required_skills,
      qualifications: jobData.qualifications || job.qualifications,
      experience: jobData.experience || job.experience,
      start_date: jobData.start_date || job.start_date,
      end_date: jobData.end_date || job.end_date,
      status: jobData.status || job.status
    });

    return job;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a job
 * @param {number} id - Job ID
 * @returns {Promise<boolean>} Success status
 */
exports.deleteJob = async (id) => {
  try {
    const job = await Job.findByPk(id);

    if (!job) {
      throw new Error('Job not found');
    }

    await job.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Close a job
 * @param {number} id - Job ID
 * @returns {Promise<Object>} Updated job
 */
exports.closeJob = async (id) => {
  try {
    const job = await Job.findByPk(id);

    if (!job) {
      throw new Error('Job not found');
    }

    await job.update({ status: 'closed' });
    return job;
  } catch (error) {
    throw error;
  }
};

/**
 * Reopen a job
 * @param {number} id - Job ID
 * @returns {Promise<Object>} Updated job
 */
exports.reopenJob = async (id) => {
  try {
    const job = await Job.findByPk(id);

    if (!job) {
      throw new Error('Job not found');
    }

    await job.update({ status: 'open' });
    return job;
  } catch (error) {
    throw error;
  }
};
