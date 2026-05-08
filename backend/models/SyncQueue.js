const mongoose = require("mongoose");

const syncQueueSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true },
    operationType: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["queued", "processed", "failed"],
      default: "queued",
    },
    processedAt: { type: Date, default: null },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SyncQueue", syncQueueSchema);
