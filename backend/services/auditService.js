const AuditLog = require("../models/AuditLog");
const { emit } = require("./socketService");

async function logActivity({
  actor,
  action,
  entityType,
  entityId,
  branch,
  summary,
  severity = "info",
  before = null,
  after = null,
  metadata = {},
}) {
  const log = await AuditLog.create({
    actor: actor ? actor._id || actor : null,
    actorRole: actor ? actor.role || "user" : "system",
    action,
    entityType,
    entityId: String(entityId),
    branch: branch || null,
    summary,
    severity,
    before,
    after,
    metadata,
  });

  emit("activity:created", log);
  return log;
}

module.exports = {
  logActivity,
};
