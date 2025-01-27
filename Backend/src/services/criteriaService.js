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

// // Apply criteria to shortlist resumes
// exports.applyShortlistingCriteria = async (shortlistingData) => {
//     const { job_id, resumes } = shortlistingData;
//     const criteria = await db.Criteria.findAll({ where: { job_id } });

//     if (!criteria) throw new Error('No criteria defined for this job');

//     // Calculate scores based on criteria weightage
//     const shortlisted = resumes.map((resume) => {
//         let totalScore = 0;
//         criteria.forEach((criterion) => {
//             if (criterion.skill && resume.skills.includes(criterion.skill)) {
//                 totalScore += criterion.weightage;
//             }
//             if (criterion.experience && resume.experience >= criterion.experience) {
//                 totalScore += criterion.weightage;
//             }
//             if (criterion.education && resume.education === criterion.education) {
//                 totalScore += criterion.weightage;
//             }
//         });
//         return { ...resume, totalScore };
//     });

//     // Sort resumes by score and return shortlisted ones
//     shortlisted.sort((a, b) => b.totalScore - a.totalScore);
//     return shortlisted;
// };

exports.applyShortlistingCriteria = async (shortlistingData) => {
    const { job_id, resumes } = shortlistingData;
    const jobCriteria = await db.JobCriteria.findOne({ where: { job_id } });

    const weightedCriteria = {
        skills: 0.4,   // 40% weight
        experience: 0.3, // 30% weight
        education: 0.2,  // 20% weight
        certifications: 0.1 // 10% weight
    };

    const scoredResumes = resumes.map(resume => {
        let totalScore = 0;

        // Skill Matching
        const skillMatch = calculateSkillMatch(resume.skills, jobCriteria.required_skills);
        totalScore += skillMatch * weightedCriteria.skills;

        // Experience Evaluation
        const experienceScore = evaluateExperience(resume.experience, jobCriteria.min_experience);
        totalScore += experienceScore * weightedCriteria.experience;

        // Education Alignment
        const educationScore = evaluateEducation(resume.education, jobCriteria.preferred_education);
        totalScore += educationScore * weightedCriteria.education;

        return {
            ...resume,
            totalScore,
            shortlistStatus: totalScore >= 70 ? 'Qualified' : 'Rejected'
        };
    });

    return scoredResumes.sort((a, b) => b.totalScore - a.totalScore);
}