const mongoose = require("mongoose");

const notificationChannelsSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "administrator",
        "manager",
        "procurement",
        "storekeeper",
        "auditor",
      ],
      default: "storekeeper",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    phone: { type: String, default: "" },
    darkMode: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordResetAt: { type: Date, default: null },
    notificationChannels: {
      type: notificationChannelsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
