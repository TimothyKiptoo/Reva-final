const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "issue",
        "return",
        "transfer_in",
        "transfer_out",
        "adjustment",
        "count",
        "sync",
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    beforeQuantity: { type: Number, required: true },
    afterQuantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    reference: { type: String, default: "" },
    notes: { type: String, default: "" },
    channel: {
      type: String,
      enum: ["manual", "barcode", "rfid", "offline_sync", "system"],
      default: "manual",
    },
    fraudScore: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

stockMovementSchema.index({ item: 1, createdAt: -1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);
