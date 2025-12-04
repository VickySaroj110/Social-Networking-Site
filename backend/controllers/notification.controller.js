import Notification from "../models/notification.model.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("sender", "userName profileImage")
      .populate("reelId", "caption")
      .populate("postId", "media caption")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    return res
      .status(500)
      .json({ message: `getNotifications error: ${error.message}` });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res
      .status(500)
      .json({ message: `getUnreadCount error: ${error.message}` });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, { read: true });
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    return res
      .status(500)
      .json({ message: `markAsRead error: ${error.message}` });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { read: true }
    );
    return res
      .status(200)
      .json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return res
      .status(500)
      .json({ message: `markAllAsRead error: ${error.message}` });
  }
};

// Clear all notifications
export const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.userId });
    return res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("clearAll error:", error);
    return res
      .status(500)
      .json({ message: `clearAll error: ${error.message}` });
  }
};
