const db = require('../models');

// Create custom shortlisting criteria
exports.createCriteria = async (criteriaData) => {
    const criteria = await db.Criteria.create(criteriaData);
    return criteria;
};

// Get criteria for a specific job
exports.getCriteria = async (job_id) => {
    const criteria = await db.Criteria.findAll({ where: { job_id } });
    if (!criteria) throw new Error('Criteria not found');
    return criteria;
};

// Apply criteria to shortlist resumes
exports.applyShortlistingCriteria = async (shortlistingData) => {
    const { job_id, resumes } = shortlistingData;
    const criteria = await db.Criteria.findAll({ where: { job_id } });

    if (!criteria) throw new Error('No criteria defined for this job');

    // Calculate scores based on criteria weightage
    const shortlisted = resumes.map((resume) => {
        let totalScore = 0;
        criteria.forEach((criterion) => {
            if (criterion.skill && resume.skills.includes(criterion.skill)) {
                totalScore += criterion.weightage;
            }
            if (criterion.experience && resume.experience >= criterion.experience) {
                totalScore += criterion.weightage;
            }
            if (criterion.education && resume.education === criterion.education) {
                totalScore += criterion.weightage;
            }
        });
        return { ...resume, totalScore };
    });

    // Sort resumes by score and return shortlisted ones
    shortlisted.sort((a, b) => b.totalScore - a.totalScore);
    return shortlisted;
};
