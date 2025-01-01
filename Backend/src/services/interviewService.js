const db = require('../models');

// Schedule an interview
exports.scheduleInterview = async (interviewData) => {
    const interview = await db.Interview.create(interviewData);
    // Implement email notifications here if needed
    return interview;
};

// List all scheduled interviews
exports.listInterviews = async (filters) => {
    const whereClause = {};
    if (filters.job_id) whereClause.job_id = filters.job_id;
    if (filters.candidate_id) whereClause.candidate_id = filters.candidate_id;
    const interviews = await db.Interview.findAll({ where: whereClause });
    return interviews;
};

// Update interview details
exports.updateInterview = async (id, interviewData) => {
    const interview = await db.Interview.findByPk(id);
    if (!interview) throw new Error('Interview not found');
    await interview.update(interviewData);
    return interview;
};
