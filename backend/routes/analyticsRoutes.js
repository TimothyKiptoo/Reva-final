const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/analyticsController");

const router = express.Router();

router.get(
  "/insights",
  authenticate,
  requirePermission("analytics.read"),
  asyncHandler(controller.getInsights)
);

module.exports = router;
