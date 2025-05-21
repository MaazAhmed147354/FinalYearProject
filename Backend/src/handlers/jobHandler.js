"use strict";
require('dotenv').config();

const jobRoutes = require('../routes/jobRoutes');
const { Job } = require('../models'); // adjust path as needed
const { Op } = require('sequelize');

module.exports.createJob = jobRoutes.createJob;
module.exports.listJobs = jobRoutes.listJobs;
module.exports.getJobDetails = jobRoutes.getJobDetails;
module.exports.updateJob = jobRoutes.updateJob;
module.exports.deleteJob = jobRoutes.deleteJob;
module.exports.closeJob = jobRoutes.closeJob;
module.exports.reopenJob = jobRoutes.reopenJob;

module.exports.closeExpiredJobs = async (event) => {
  const now = new Date();
  const jobsToClose = await Job.findAll({
    where: {
      end_date: { [Op.lt]: now },
      status: { [Op.ne]: 'closed' }
    }
  });

  for (const job of jobsToClose) {
    await job.update({ status: 'closed' });
    console.log(`Closed job: ${job.title} (ID: ${job.id})`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ closed: jobsToClose.length }),
  };
};