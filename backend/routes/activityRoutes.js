const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/activityController");

const router = express.Router();

router.get(
  "/",
  authenticate,
  requirePermission("timeline.read"),
  asyncHandler(controller.listActivity)
);

module.exports = router;
