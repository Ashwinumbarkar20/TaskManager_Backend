const User = require("../models/user.model");
const {
  createAccessToken,
  extractBearerToken,
  verifyAccessToken,
} = require("../utils/auth.utils");
const { sendSuccess, sendError } = require("../utils/response");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "User already exists with this email");
    }

    const user = await User.create({ name, email, password });
    const token = createAccessToken({ userId: user._id, role: user.role });

    return sendSuccess(res, 201, "User registered successfully", {
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to register user", error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }
    if (!user.isActive) {
      return sendError(res, 403, "Your account is deactivated");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = createAccessToken({ userId: user._id, role: user.role });

    return sendSuccess(res, 200, "Login successful", {
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to login", error.message);
  }
};

const me = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return sendError(res, 401, "Authorization token is missing");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User profile fetched successfully", {
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token", error.message);
  }
};

module.exports = { register, login, me };
