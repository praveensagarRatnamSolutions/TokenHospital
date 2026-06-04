const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { protect } = require("../../middlewares/authMiddleware");

// All notification routes are protected
router.use(protect);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
