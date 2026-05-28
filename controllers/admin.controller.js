const Task = require("../models/task.model");
const User = require("../models/user.model");
const { sendError, sendSuccess } = require("../utils/response");

const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, totalTasks, statusBuckets] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        Task.countDocuments(),
        Task.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ]),
      ]);

    const statusMap = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    statusBuckets.forEach((bucket) => {
      statusMap[bucket.status] = bucket.count;
    });

    return sendSuccess(res, 200, "Admin dashboard fetched successfully", {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      tasks: {
        total: totalTasks,
        byStatus: statusMap,
      },
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch admin dashboard", error.message);
  }
};

const getUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (typeof req.query.isActive === "boolean") {
      filters.isActive = req.query.isActive;
    }
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filters)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filters),
    ]);

    return sendSuccess(res, 200, "Users fetched successfully", {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch users", error.message);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (String(req.user._id) === String(userId) && isActive === false) {
      return sendError(res, 400, "Admin cannot deactivate own account");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User status updated successfully", { user });
  } catch (error) {
    return sendError(res, 500, "Failed to update user status", error.message);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
};
