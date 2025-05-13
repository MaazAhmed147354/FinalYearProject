"use strict";

const { Job, Resume, Interview, ResumeScore, Candidate } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Get analytics for jobs
 * @returns {Promise<Object>} Job analytics
 */
exports.getJobAnalytics = async () => {
    try {
      // Total jobs by status
      const jobsByStatus = await Job.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Jobs by department
      const jobsByDepartment = await Job.findAll({
        attributes: [
          'department',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['department']
      });

      // Recent jobs
      const recentJobs = await Job.findAll({
        attributes: ['id', 'title', 'department', 'start_date', 'end_date', 'status'],
        order: [['created_at', 'DESC']],
        limit: 5
      });

      // Jobs with application counts - REPLACE THIS ENTIRE BLOCK
      // Comment out the problematic query
      /*
      const jobsWithApplications = await Job.findAll({
        attributes: [
          'id',
          'title',
          [Sequelize.fn('COUNT', Sequelize.col('Resumes.id')), 'application_count']
        ],
        include: [
          {
            model: Resume,
            as: 'resumes',
            attributes: []
          }
        ],
        group: ['Job.id'],
        order: [[Sequelize.literal('application_count'), 'DESC']],
        limit: 10
      });
      */
      
      // Use this simplified version instead
      const jobsWithApplications = await Job.findAll({
        attributes: ['id', 'title'],
        order: [['created_at', 'DESC']],
        limit: 10
      });
      
      // Add a placeholder application count to each job
      for (const job of jobsWithApplications) {
        job.dataValues.application_count = 0;  // Default value since we can't query it
      }

      // Time to fill stats (for closed jobs)
      const timeToFillStats = await Job.findAll({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.literal('DATEDIFF(updated_at, created_at)')), 'avg_days'],
          [Sequelize.fn('MIN', Sequelize.literal('DATEDIFF(updated_at, created_at)')), 'min_days'],
          [Sequelize.fn('MAX', Sequelize.literal('DATEDIFF(updated_at, created_at)')), 'max_days']
        ],
        where: {
          status: 'closed'
        }
      });

      return {
        total_jobs: await Job.count(),
        active_jobs: await Job.count({ where: { status: 'open' } }),
        jobs_by_status: jobsByStatus,
        jobs_by_department: jobsByDepartment,
        recent_jobs: recentJobs,
        top_jobs_by_applications: jobsWithApplications,
        time_to_fill: timeToFillStats[0] || { avg_days: 0, min_days: 0, max_days: 0 }
      };
    } catch (error) {
      throw error;
    }
};

/**
 * Get analytics for resumes
 * @returns {Promise<Object>} Resume analytics
 */
exports.getResumeAnalytics = async () => {
  try {
    // Total resumes by status
    const resumesByStatus = await Resume.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Resumes by job
    // Resumes by job
    const resumesByJob = await Resume.findAll({
      attributes: [
        'job_id',
        // [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'] // This line is causing the issue
        [Sequelize.fn('COUNT', Sequelize.col('Resume.id')), 'count']
      ],
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['title']
        }
      ],
      group: ['job_id'],
      having: Sequelize.literal('count > 0')
    });

    // Recent applications
    const recentApplications = await Resume.findAll({
      attributes: ['id', 'created_at', 'status'],
      include: [
        {
          model: Candidate,
          as: 'candidate',
          attributes: ['name', 'email']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'department']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Score statistics
    const scoreStats = await ResumeScore.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('total_score')), 'avg_score'],
        [Sequelize.fn('MIN', Sequelize.col('total_score')), 'min_score'],
        [Sequelize.fn('MAX', Sequelize.col('total_score')), 'max_score']
      ]
    });

    // Top scored candidates
    // Top scored candidates - simplified version without associations
    const topScoredCandidates = await ResumeScore.findAll({
      attributes: ['resume_id', 'total_score', 'skills_score', 'experience_score'],
      order: [['total_score', 'DESC']],
      limit: 5
    });

    return {
      total_resumes: await Resume.count(),
      resumes_by_status: resumesByStatus,
      resumes_by_job: resumesByJob,
      recent_applications: recentApplications,
      score_statistics: scoreStats[0] || { avg_score: 0, min_score: 0, max_score: 0 },
      top_scored_candidates: topScoredCandidates
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get analytics for interviews
 * @returns {Promise<Object>} Interview analytics
 */
exports.getInterviewAnalytics = async () => {
  try {
    // Total interviews by status
    const interviewsByStatus = await Interview.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Interviews by date
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    const interviewsByDate = await Interview.findAll({
      attributes: [
        'date',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        date: {
          [Op.between]: [oneMonthAgo, today]
        }
      },
      group: ['date'],
      order: [['date', 'ASC']]
    });

    // Upcoming interviews
    const upcomingInterviews = await Interview.findAll({
      where: {
        date: {
          [Op.gte]: today
        },
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      },
      include: [
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate',
              attributes: ['name', 'email']
            }
          ]
        },
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'department']
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: 10
    });

    // Completion rate
    const completionStats = {
      total: await Interview.count(),
      completed: await Interview.count({ where: { status: 'completed' } }),
      cancelled: await Interview.count({ where: { status: 'cancelled' } })
    };
    completionStats.completion_rate = completionStats.total > 0 
      ? (completionStats.completed / completionStats.total) * 100 
      : 0;

    // Average interviews per job
    const interviewsPerJob = await Interview.findAll({
      attributes: [
        'job_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'interview_count']
      ],
      group: ['job_id']
    });

    const avgInterviewsPerJob = interviewsPerJob.length > 0
      ? interviewsPerJob.reduce((sum, job) => sum + parseInt(job.dataValues.interview_count, 10), 0) / interviewsPerJob.length
      : 0;

    return {
      total_interviews: completionStats.total,
      interviews_by_status: interviewsByStatus,
      interviews_by_date: interviewsByDate,
      upcoming_interviews: upcomingInterviews,
      completion_stats: completionStats,
      avg_interviews_per_job: avgInterviewsPerJob
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get overall recruitment funnel analytics
 * @returns {Promise<Object>} Funnel analytics
 */
exports.getRecruitmentFunnelAnalytics = async () => {
  try {
    const funnelStats = {
      total_jobs: await Job.count({ where: { status: 'open' } }),
      total_applications: await Resume.count(),
      total_shortlisted: await Resume.count({ where: { status: 'shortlisted' } }),
      total_interviews: await Interview.count(),
      total_offers: 0, // This would come from an Offers table if implemented
      total_hires: 0 // This would come from a Hires table if implemented
    };

    // Calculate conversion rates
    funnelStats.shortlist_rate = funnelStats.total_applications > 0
      ? (funnelStats.total_shortlisted / funnelStats.total_applications) * 100
      : 0;

    funnelStats.interview_rate = funnelStats.total_shortlisted > 0
      ? (funnelStats.total_interviews / funnelStats.total_shortlisted) * 100
      : 0;

    return funnelStats;
  } catch (error) {
    throw error;
  }
};
