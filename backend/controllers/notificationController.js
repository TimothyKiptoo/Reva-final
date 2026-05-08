const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const { logActivity } = require("../services/auditService");
const { httpError } = require("../utils/httpError");

async function listNotifications(req, res) {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(40)
    .populate("recipients", "name email role")
    .populate("branch", "name code")
    .populate("item", "name inventoryNumber");

  res.json({ notifications });
}

async function listAlerts(req, res) {
  const alerts = await Alert.find()
    .sort({ createdAt: -1 })
    .limit(40)
    .populate("branch", "name code")
    .populate("item", "name inventoryNumber");

  res.json({ alerts });
}

async function resolveAlert(req, res) {
  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    throw httpError(404, "Alert not found.");
  }

  alert.status = "resolved";
  await alert.save();

  await logActivity({
    actor: req.user,
    action: "alert.resolve",
    entityType: "Alert",
    entityId: alert._id,
    branch: alert.branch,
    summary: `Resolved alert '${alert.title}'.`,
    after: alert.toObject(),
  });

  res.json({ alert });
}

module.exports = {
  listNotifications,
  listAlerts,
  resolveAlert,
};
