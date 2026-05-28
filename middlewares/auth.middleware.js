const User = require("../models/user.model");
const { extractBearerToken, verifyAccessToken } = require("../utils/auth.utils");
const { sendError } = require("../utils/response");

const ValidateToken = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization || "");
    if (!token) {
      return sendError(res, 401, "Authorization token is missing");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return sendError(res, 401, "Invalid token user");
    }
    if (!user.isActive) {
      return sendError(res, 403, "Your account is deactivated");
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token", error.message);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return sendError(res, 403, "Admin access is required");
  }

  return next();
};

module.exports = {
  ValidateToken,
  requireAdmin,
};
