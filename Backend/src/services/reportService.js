const db = require('../models');

// Generate a detailed report for a candidate
exports.generateCandidateReport = async (resume_id) => {
    const resume = await db.Resume.findByPk(resume_id);
    if (!resume) throw new Error('Resume not found');

    // Simulate AI-based analysis for strengths, weaknesses, and suggestions
    const strengths = ['Excellent in Python', 'Strong leadership skills'];
    const weaknesses = ['Limited experience in cloud technologies'];
    const suggestions = ['Gain hands-on experience with AWS or Azure'];

    const report = await db.Report.create({
        resume_id,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        suggestions: JSON.stringify(suggestions),
    });

    return report;
};

// Compare multiple candidates side-by-side
exports.compareCandidates = async (resume_ids) => {
    const resumes = await db.Resume.findAll({
        where: {
            id: resume_ids.split(',')
        }
    });

    if (resumes.length < 2) throw new Error('At least two candidates are required for comparison');

    // Simulate comparison logic
    const comparison = resumes.map(resume => ({
        id: resume.id,
        name: resume.candidate_name,
        score: resume.score,
        strengths: ['Placeholder strengths'],
        weaknesses: ['Placeholder weaknesses'],
    }));

    return comparison;
};
