const jwt = require("jsonwebtoken");
const defaults = require("../config/defaults");

function toId(value) {
  if (!value) {
    return null;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      branchId: toId(user.branch),
      email: user.email,
    },
    defaults.jwtSecret,
    { expiresIn: defaults.tokenTtl }
  );
}

module.exports = {
  signUserToken,
};
