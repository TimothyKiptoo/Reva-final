const mongoose = require("mongoose");

const aiSnapshotSchema = new mongoose.Schema(
  {
    predictedDepletionDays: { type: Number, default: null },
    healthScore: { type: Number, default: 100 },
    lastForecastAt: { type: Date, default: null },
    smartReorderStatus: { type: String, default: "stable" },
    procurementSuggestion: { type: String, default: "" },
    fraudWatch: { type: Boolean, default: false },
  },
  { _id: false }
);

const inventoryItemSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      name: { type: String, required: true, trim: true },
      code: { type: String, required: true, trim: true, uppercase: true },
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    unit: { type: String, default: "pcs" },
    sku: { type: String, default: "" },
    inventoryNumber: { type: String, required: true, trim: true },
    barcode: { type: String, default: "" },
    barcodeImageUrl: { type: String, default: "" },
    rfidTag: { type: String, default: "" },
    quantityOnHand: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    minimumLevel: { type: Number, default: 5 },
    reorderLevel: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 25 },
    unitCost: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "low_stock", "out_of_stock", "discontinued"],
      default: "active",
    },
    lastPurchaseAt: { type: Date, default: null },
    lastMovementAt: { type: Date, default: null },
    ai: { type: aiSnapshotSchema, default: () => ({}) },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventoryItemSchema.virtual("availableQuantity").get(function availableQuantity() {
  return this.quantityOnHand - this.reservedQuantity;
});

inventoryItemSchema.index({ inventoryNumber: 1 }, { unique: true });
inventoryItemSchema.index({ barcode: 1 }, { unique: true, sparse: true });
inventoryItemSchema.index({ branch: 1, name: 1 });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
