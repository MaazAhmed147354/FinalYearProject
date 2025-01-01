const db = require('../models');

// Create a new job
exports.createJob = async (jobData) => {
    const job = await db.Job.create(jobData);
    return job;
};

// List all jobs
exports.listJobs = async (filters) => {
    const whereClause = {};
    if (filters.status) whereClause.status = filters.status;
    const jobs = await db.Job.findAll({ where: whereClause });
    return jobs;
};

// Get job details
exports.getJobDetails = async (id) => {
    const job = await db.Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    return job;
};

// Update job details
exports.updateJob = async (id, jobData) => {
    const job = await db.Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    await job.update(jobData);
    return job;
};

// Delete a job posting
exports.deleteJob = async (id) => {
    const job = await db.Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    await job.destroy();
};
