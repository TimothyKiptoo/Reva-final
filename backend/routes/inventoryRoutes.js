const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/inventoryController");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  requirePermission("inventory.read"),
  asyncHandler(controller.getDashboard)
);
router.get(
  "/export",
  authenticate,
  requirePermission("inventory.read"),
  asyncHandler(controller.exportInventory)
);
router.post(
  "/sync",
  authenticate,
  requirePermission("inventory.move"),
  asyncHandler(controller.syncOffline)
);
router.post(
  "/ai-agent/run",
  authenticate,
  requirePermission("inventory.ai"),
  asyncHandler(controller.runAiAutoStock)
);
router.get(
  "/",
  authenticate,
  requirePermission("inventory.read"),
  asyncHandler(controller.listInventory)
);
router.post(
  "/",
  authenticate,
  requirePermission("inventory.write"),
  asyncHandler(controller.createItem)
);
router.patch(
  "/:id",
  authenticate,
  requirePermission("inventory.write"),
  asyncHandler(controller.updateItem)
);
router.post(
  "/:id/movements",
  authenticate,
  requirePermission("inventory.move"),
  asyncHandler(controller.createMovement)
);

module.exports = router;
