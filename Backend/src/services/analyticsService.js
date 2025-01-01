const db = require('../models');

// Get job-related analytics
exports.getJobAnalytics = async () => {
    const analytics = await db.sequelize.query(
        `SELECT status, COUNT(*) AS total_jobs FROM jobs GROUP BY status`,
        { type: db.Sequelize.QueryTypes.SELECT }
    );
    return analytics;
};

// Get resume-related analytics
exports.getResumeAnalytics = async () => {
    const analytics = await db.sequelize.query(
        `SELECT status, COUNT(*) AS total_resumes FROM resumes GROUP BY status`,
        { type: db.Sequelize.QueryTypes.SELECT }
    );
    return analytics;
};

// Get interview-related analytics
exports.getInterviewAnalytics = async () => {
    const analytics = await db.sequelize.query(
        `SELECT DATE(interview_date) AS date, COUNT(*) AS total_interviews FROM interviews GROUP BY DATE(interview_date)`,
        { type: db.Sequelize.QueryTypes.SELECT }
    );
    return analytics;
};
