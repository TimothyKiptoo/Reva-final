const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: "" },
    subcategories: { type: [subcategorySchema], default: [] },
  },
  { timestamps: true }
);

categorySchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
