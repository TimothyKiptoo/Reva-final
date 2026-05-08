const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

departmentSchema.index({ code: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
