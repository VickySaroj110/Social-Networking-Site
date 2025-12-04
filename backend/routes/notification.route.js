import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
} from "../controllers/notification.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.get("/unread-count", isAuth, getUnreadCount);
router.patch("/:notificationId/read", isAuth, markAsRead);
router.patch("/mark-all-read", isAuth, markAllAsRead);
router.delete("/clear-all", isAuth, clearAll);

export default router;
