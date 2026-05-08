const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    leadTimeDays: { type: Number, default: 7 },
    reliabilityScore: { type: Number, default: 80 },
    preferredCategoryCodes: { type: [String], default: [] },
  },
  { timestamps: true }
);

supplierSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Supplier", supplierSchema);
