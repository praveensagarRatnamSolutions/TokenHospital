const Notification = require("./notification.model");
const socketHandler = require("../../socket/socketHandler");

/**
 * Get notifications for a user
 */
const getNotifications = async (userId, limit = 50) => {
  return await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

/**
 * Create a new notification, save to DB, and broadcast to the hospital room via WebSockets
 */
const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  
  try {
    // Broadcast notification in real-time to the hospital socket room
    socketHandler.broadcastToHospital(
      notificationData.hospitalId,
      "new-notification",
      {
        notification,
      }
    );
  } catch (err) {
    console.error("Socket broadcast for notification failed:", err.message);
  }

  return notification;
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
