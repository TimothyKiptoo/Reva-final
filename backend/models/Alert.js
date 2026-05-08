const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["low_stock", "reorder", "fraud", "procurement", "sync"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      default: null,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recommendation: { type: String, default: "" },
    predictedDaysRemaining: { type: Number, default: null },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
