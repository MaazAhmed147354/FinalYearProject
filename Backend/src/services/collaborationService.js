const db = require('../models');

// Add a comment
exports.addComment = async (commentData) => {
    const comment = await db.Comment.create(commentData);
    return comment;
};

// Fetch notifications for a user
exports.fetchNotifications = async (user_id) => {
    const notifications = await db.Notification.findAll({
        where: { user_id },
        order: [['created_at', 'DESC']]
    });
    return notifications;
};
