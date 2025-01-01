const db = require('../models');

// Upload a resume
exports.uploadResume = async (resumeData, file) => {
    // Process and parse the resume here, integrating with GPT if needed
    const parsedData = {}; // Simulate GPT-based parsing
    const newResume = await db.Resume.create({
        candidate_name: resumeData.candidate_name,
        job_id: resumeData.job_id,
        resume_file: file.path,
        parsed_data: JSON.stringify(parsedData),
        status: 'Pending',
        score: resumeData.score || 0,
    });
    return newResume;
};

// List all resumes
exports.listResumes = async (filters) => {
    const whereClause = {};
    if (filters.job_id) whereClause.job_id = filters.job_id;
    if (filters.status) whereClause.status = filters.status;
    const resumes = await db.Resume.findAll({ where: whereClause });
    return resumes;
};

// Get parsed resume details
exports.getResumeDetails = async (id) => {
    const resume = await db.Resume.findByPk(id);
    if (!resume) throw new Error('Resume not found');
    return resume;
};

// Update resume status
exports.updateResumeStatus = async (id, status) => {
    const resume = await db.Resume.findByPk(id);
    if (!resume) throw new Error('Resume not found');
    await resume.update({ status });
    return resume;
};
