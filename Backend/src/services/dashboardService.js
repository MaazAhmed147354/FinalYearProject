"use strict";

const { Job, Resume, Interview, Candidate, ResumeScore, sequelize } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Get statistics for dashboard
 * @returns {Promise<Object>} Dashboard statistics
 */
exports.getDashboardStats = async () => {
  try {
    // Get active jobs count
    const activeJobs = await Job.count({
      where: { status: 'open' }
    });

    // Get total applications count
    const totalApplications = await Resume.count();

    // Get scheduled interviews count - using 'date' field instead of 'interview_date'
    const scheduledInterviews = await Interview.count({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        date: { [Op.gte]: new Date() }
      }
    });

    // Get jobs with their application counts
    const jobsWithStats = await Job.findAll({
      attributes: [
        'id', 
        'title', 
        'status',
        'start_date',
        'end_date',
        [sequelize.literal('(SELECT COUNT(*) FROM resumes WHERE resumes.job_id = Job.id)'), 'applications_count'],
        [sequelize.literal('(SELECT COUNT(*) FROM resumes WHERE resumes.job_id = Job.id AND resumes.status = "shortlisted")'), 'shortlisted_count'],
        [sequelize.literal('(SELECT COUNT(*) FROM interviews WHERE interviews.job_id = Job.id)'), 'interviews_count']
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      activeJobs,
      totalApplications,
      scheduledInterviews,
      jobs: jobsWithStats
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Import job openings from external source
 * This is a mock implementation - replace with actual import logic
 * @returns {Promise<Object>} Import results
 */
exports.importJobOpenings = async () => {
  try {
    // This would connect to an external API or import from a file
    // For now, it's just creating some mock job openings
    
    const mockJobs = [
      {
        title: "Backend Developer",
        description: "We are looking for an experienced backend developer with Node.js expertise.",
        department: "engineering",
        required_skills: ["Node.js", "Express", "MongoDB", "AWS"],
        qualifications: "Bachelor's in Computer Science or equivalent",
        experience: "3-5 years",
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "open",
        created_by: 1
      },
      {
        title: "Frontend Engineer",
        description: "Join our team as a frontend engineer working with React.",
        department: "engineering",
        required_skills: ["React", "JavaScript", "CSS", "TypeScript"],
        qualifications: "Bachelor's degree in related field",
        experience: "2-4 years",
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "open",
        created_by: 1
      },
      {
        title: "UX Designer",
        description: "Design intuitive user experiences for our products.",
        department: "design",
        required_skills: ["Figma", "Adobe XD", "User Research"],
        qualifications: "Bachelor's in Design or equivalent",
        experience: "2+ years",
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "open",
        created_by: 1
      }
    ];
    
    // Create all jobs
    const createdJobs = await Job.bulkCreate(mockJobs);
    
    return {
      success: true,
      count: createdJobs.length,
      message: `Successfully imported ${createdJobs.length} job openings`
    };
  } catch (error) {
    console.error('Error importing job openings:', error);
    throw error;
  }
}; 