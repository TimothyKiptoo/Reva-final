const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/purchaseOrderController");

const router = express.Router();

router.get(
  "/",
  authenticate,
  requirePermission("purchase.read"),
  asyncHandler(controller.listPurchaseOrders)
);
router.post(
  "/",
  authenticate,
  requirePermission("purchase.write"),
  asyncHandler(controller.createPurchaseOrder)
);
router.patch(
  "/:id",
  authenticate,
  requirePermission("purchase.write"),
  asyncHandler(controller.updatePurchaseOrder)
);
router.post(
  "/:id/receive",
  authenticate,
  requirePermission("purchase.write"),
  asyncHandler(controller.receivePurchaseOrder)
);

module.exports = router;
