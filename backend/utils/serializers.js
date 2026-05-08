function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    branch: user.branch,
    department: user.department,
    notificationChannels: user.notificationChannels,
    darkMode: user.darkMode,
    isActive: user.isActive,
    deactivatedAt: user.deactivatedAt,
    lastLoginAt: user.lastLoginAt,
    passwordResetAt: user.passwordResetAt,
    createdAt: user.createdAt,
  };
}

module.exports = {
  sanitizeUser,
};
