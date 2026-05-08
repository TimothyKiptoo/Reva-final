const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/notificationController");

const router = express.Router();

router.get(
  "/",
  authenticate,
  requirePermission("alerts.read"),
  asyncHandler(controller.listNotifications)
);
router.get(
  "/alerts",
  authenticate,
  requirePermission("alerts.read"),
  asyncHandler(controller.listAlerts)
);
router.patch(
  "/alerts/:id/resolve",
  authenticate,
  requirePermission("alerts.read"),
  asyncHandler(controller.resolveAlert)
);

module.exports = router;
