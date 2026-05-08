const InventoryItem = require("../models/InventoryItem");
const PurchaseOrder = require("../models/PurchaseOrder");
const { applyStockMovement } = require("../services/inventoryService");
const { logActivity } = require("../services/auditService");
const { httpError } = require("../utils/httpError");

async function listPurchaseOrders(req, res) {
  const purchaseOrders = await PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .populate("supplier", "name contactPerson")
    .populate("branch", "name code")
    .populate("createdBy", "name role");

  res.json({ purchaseOrders });
}

async function createPurchaseOrder(req, res) {
  const lineItems = await Promise.all(
    (req.body.lineItems || []).map(async (line) => {
      const item = await InventoryItem.findById(line.item);
      if (!item) {
        throw httpError(400, `Inventory item ${line.item} could not be found.`);
      }

      const quantity = Number(line.quantity || 0);
      const unitCost = Number(line.unitCost || item.unitCost || 0);
      return {
        item: item._id,
        inventoryNumber: item.inventoryNumber,
        name: item.name,
        quantity,
        unitCost,
        total: quantity * unitCost,
      };
    })
  );

  const purchaseOrder = await PurchaseOrder.create({
    supplier: req.body.supplier || null,
    branch: req.body.branch,
    createdBy: req.user._id,
    lineItems,
    status: req.body.status || "recommended",
    expectedDelivery: req.body.expectedDelivery || null,
    reason: req.body.reason || "",
    notes: req.body.notes || "",
    aiConfidence: Number(req.body.aiConfidence || 0),
    totalCost: lineItems.reduce((sum, line) => sum + line.total, 0),
  });

  await logActivity({
    actor: req.user,
    action: "purchase.create",
    entityType: "PurchaseOrder",
    entityId: purchaseOrder._id,
    branch: purchaseOrder.branch,
    summary: `Created purchase order ${purchaseOrder._id}.`,
    after: purchaseOrder.toObject(),
  });

  const populated = await PurchaseOrder.findById(purchaseOrder._id)
    .populate("supplier", "name contactPerson")
    .populate("branch", "name code")
    .populate("createdBy", "name role");

  res.status(201).json({ purchaseOrder: populated });
}

async function updatePurchaseOrder(req, res) {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id);
  if (!purchaseOrder) {
    throw httpError(404, "Purchase order not found.");
  }

  const before = purchaseOrder.toObject();
  purchaseOrder.status = req.body.status || purchaseOrder.status;
  purchaseOrder.notes = req.body.notes ?? purchaseOrder.notes;
  if (purchaseOrder.status === "approved") {
    purchaseOrder.approvedBy = req.user._id;
  }
  await purchaseOrder.save();

  await logActivity({
    actor: req.user,
    action: "purchase.update",
    entityType: "PurchaseOrder",
    entityId: purchaseOrder._id,
    branch: purchaseOrder.branch,
    summary: `Updated purchase order ${purchaseOrder._id} to ${purchaseOrder.status}.`,
    before,
    after: purchaseOrder.toObject(),
  });

  res.json({ purchaseOrder });
}

async function receivePurchaseOrder(req, res) {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id);
  if (!purchaseOrder) {
    throw httpError(404, "Purchase order not found.");
  }

  for (const line of purchaseOrder.lineItems) {
    await applyStockMovement({
      itemId: line.item,
      payload: {
        type: "purchase",
        quantity: line.quantity,
        unitCost: line.unitCost,
        reference: `PO-${purchaseOrder._id}`,
        notes: "Purchase order received",
        channel: "manual",
      },
      user: req.user,
      purchaseOrderId: purchaseOrder._id,
    });
  }

  purchaseOrder.status = "received";
  purchaseOrder.receivedAt = new Date();
  await purchaseOrder.save();

  await logActivity({
    actor: req.user,
    action: "purchase.receive",
    entityType: "PurchaseOrder",
    entityId: purchaseOrder._id,
    branch: purchaseOrder.branch,
    summary: `Received purchase order ${purchaseOrder._id}.`,
    after: purchaseOrder.toObject(),
  });

  res.json({ purchaseOrder });
}

module.exports = {
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
};
