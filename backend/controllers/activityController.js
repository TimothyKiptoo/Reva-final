const AuditLog = require("../models/AuditLog");

async function listActivity(req, res) {
  const activity = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(60)
    .populate("actor", "name email role")
    .populate("branch", "name code");

  res.json({ activity });
}

module.exports = {
  listActivity,
};
