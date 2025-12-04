import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaTimes } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import {
  setNotifications,
  markAsRead,
  markAllAsRead,
  clearAll,
  setUnreadCount,
} from "../redux/notificationSlice";
import dp1 from "../assets/dp1.jpeg";

function Notifications() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log("📡 Fetching notifications...");
      const response = await axios.get(`${serverUrl}/api/notification`, {
        withCredentials: true,
      });
      console.log("✅ Notifications response:", response.data);
      dispatch(setNotifications(response.data));
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${serverUrl}/api/notification/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(
        `${serverUrl}/api/notification/mark-all-read`,
        {},
        { withCredentials: true }
      );
      dispatch(markAllAsRead());
      dispatch(setUnreadCount(0));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${serverUrl}/api/notification/clear-all`, {
        withCredentials: true,
      });
      dispatch(clearAll());
      dispatch(setUnreadCount(0));
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-[19px] mt-[10px] mb-[10px]">
          Notifications
        </h1>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-500 text-xs hover:text-blue-400"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-red-500 text-xs hover:text-red-400"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-gray-400 text-center mt-10">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                notification.read ? "bg-gray-900" : "bg-blue-900/20"
              }`}
              onClick={() => {
                if (!notification.read) {
                  handleMarkAsRead(notification._id);
                }
              }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 flex-shrink-0">
                <img
                  src={notification.sender?.profileImage || dp1}
                  alt={notification.sender?.userName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  <span className="font-semibold">
                    {notification.sender?.userName}
                  </span>
                  <span className="ml-1">{notification.message}</span>
                  {notification.reelId?.caption && (
                    <span className="ml-1 text-gray-400">
                      "
                      {notification.reelId.caption.length > 30
                        ? notification.reelId.caption.substring(0, 30) + "..."
                        : notification.reelId.caption}
                      "
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <FaHeart className="text-red-500 w-3 h-3" />
                  <span className="text-gray-400 text-xs">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
