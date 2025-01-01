const db = require('../models');

// Create feedback for a rejected candidate
exports.createFeedback = async (feedbackData) => {
    const feedback = await db.Feedback.create(feedbackData);
    return feedback;
};

// View feedback for a specific candidate
exports.getFeedback = async (id) => {
    const feedback = await db.Feedback.findOne({ where: { id } });
    if (!feedback) throw new Error('Feedback not found');
    return feedback;
};
