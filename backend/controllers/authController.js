const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/passwords");
const { signUserToken } = require("../utils/tokens");
const { sanitizeUser } = require("../utils/serializers");
const { logActivity } = require("../services/auditService");
const { httpError } = require("../utils/httpError");

async function register(req, res) {
  const userCount = await User.countDocuments();
  if (userCount > 0 && (!req.user || req.user.role !== "administrator")) {
    throw httpError(403, "Only administrators can create new users.");
  }

  const existing = await User.findOne({ email: String(req.body.email).toLowerCase() });
  if (existing) {
    throw httpError(409, "A user with that email already exists.");
  }

  const password = hashPassword(req.body.password);
  const user = await User.create({
    name: req.body.name,
    email: String(req.body.email).toLowerCase(),
    passwordHash: password.hash,
    passwordSalt: password.salt,
    role: req.body.role || "storekeeper",
    branch: req.body.branch || null,
    department: req.body.department || null,
    phone: req.body.phone || "",
    darkMode: String(req.body.darkMode) === "true" || req.body.darkMode === true,
    notificationChannels: req.body.notificationChannels || {},
  });

  const populated = await User.findById(user._id)
    .populate("branch", "name code")
    .populate("department", "name code");
  const token = signUserToken(populated);

  await logActivity({
    actor: req.user,
    action: "auth.register",
    entityType: "User",
    entityId: populated._id,
    summary: `Created user account for ${populated.email}.`,
    after: sanitizeUser(populated),
  });

  res.status(201).json({
    token,
    user: sanitizeUser(populated),
  });
}

async function login(req, res) {
  const email = String(req.body.email || "").toLowerCase();
  const password = String(req.body.password || "");
  const user = await User.findOne({ email })
    .populate("branch", "name code")
    .populate("department", "name code");

  if (!user) {
    throw httpError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw httpError(
      403,
      "This account is deactivated. Please contact your administrator."
    );
  }

  if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    throw httpError(401, "Invalid email or password.");
  }

  user.lastLoginAt = new Date();
  await user.save();
  const token = signUserToken(user);
  await logActivity({
    actor: user,
    action: "auth.login",
    entityType: "User",
    entityId: user._id,
    summary: `${user.email} signed in.`,
  });

  res.json({
    token,
    user: sanitizeUser(user),
  });
}

async function me(req, res) {
  res.json({
    user: sanitizeUser(req.user),
  });
}

module.exports = {
  register,
  login,
  me,
};
