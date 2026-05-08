const mongoose = require("mongoose");

const purchaseLineSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    inventoryNumber: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lineItems: { type: [purchaseLineSchema], required: true, default: [] },
    status: {
      type: String,
      enum: [
        "draft",
        "recommended",
        "approved",
        "ordered",
        "received",
        "cancelled",
      ],
      default: "draft",
    },
    expectedDelivery: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    reason: { type: String, default: "" },
    notes: { type: String, default: "" },
    aiConfidence: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
