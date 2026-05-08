const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { emit } = require("./socketService");

async function createNotification({
  channel = "in_app",
  title,
  message,
  recipients = [],
  branch = null,
  item = null,
  metadata = {},
}) {
  const notification = await Notification.create({
    channel,
    title,
    message,
    recipients,
    branch,
    item,
    status: "sent",
    metadata,
  });

  emit("notification:created", notification);
  return notification;
}

async function notifyRoles({
  roles,
  title,
  message,
  branch = null,
  item = null,
  metadata = {},
}) {
  const users = await User.find({ role: { $in: roles } }).select("_id name email");
  if (!users.length) {
    return null;
  }

  const recipients = users.map((user) => user._id);
  const notification = await createNotification({
    title,
    message,
    recipients,
    branch,
    item,
    metadata,
  });

  users.forEach((user) => {
    if (metadata.channelHint === "sms") {
      console.log(`[SMS SIMULATION] ${user.email}: ${title} - ${message}`);
    }
    if (metadata.channelHint === "email") {
      console.log(`[EMAIL SIMULATION] ${user.email}: ${title} - ${message}`);
    }
  });

  return notification;
}

async function upsertOperationalAlert({
  type,
  severity,
  branch = null,
  item = null,
  title,
  message,
  recommendation = "",
  predictedDaysRemaining = null,
  metadata = {},
}) {
  const query = {
    type,
    branch: branch || null,
    item: item || null,
    title,
    status: "open",
  };

  let alert = await Alert.findOne(query);
  if (alert) {
    alert.message = message;
    alert.severity = severity;
    alert.recommendation = recommendation;
    alert.predictedDaysRemaining = predictedDaysRemaining;
    alert.metadata = metadata;
    await alert.save();
  } else {
    alert = await Alert.create({
      type,
      severity,
      branch,
      item,
      title,
      message,
      recommendation,
      predictedDaysRemaining,
      metadata,
    });
  }

  emit("alert:created", alert);
  return alert;
}

module.exports = {
  createNotification,
  notifyRoles,
  upsertOperationalAlert,
};
