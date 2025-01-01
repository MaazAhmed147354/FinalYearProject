const jobService = require('../services/jobService');

// Create a new job
exports.createJob = async (req, res) => {
    try {
        const job = await jobService.createJob(req.body);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// List all jobs
exports.listJobs = async (req, res) => {
    try {
        const jobs = await jobService.listJobs(req.query);
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get job details
exports.getJobDetails = async (req, res) => {
    try {
        const job = await jobService.getJobDetails(req.params.id);
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update job details
exports.updateJob = async (req, res) => {
    try {
        const job = await jobService.updateJob(req.params.id, req.body);
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a job posting
exports.deleteJob = async (req, res) => {
    try {
        await jobService.deleteJob(req.params.id);
        res.status(200).json({ success: true, message: 'Job deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};