const express = require('express');
const jobController = require('../controllers/jobController');
const router = express.Router();

// Define the job management routes
router.post('/jobs', jobController.createJob);
router.get('/jobs', jobController.listJobs);
router.get('/jobs/:id', jobController.getJobDetails);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id', jobController.deleteJob);

module.exports = router;