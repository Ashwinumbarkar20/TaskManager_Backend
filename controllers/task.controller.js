const mongoose = require("mongoose");
const Task = require("../models/task.model");
const { sendSuccess, sendError } = require("../utils/response");

const buildTaskFilters = (query, userId) => {
  const filters = { user: userId };

  if (query.status) {
    filters.status = query.status;
  }

  if (query.priority) {
    filters.priority = query.priority;
  }

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  return filters;
};

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getTasks = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filters = buildTaskFilters(req.query, req.user._id);

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [tasks, total] = await Promise.all([
      Task.find(filters).sort(sort).skip(skip).limit(limit),
      Task.countDocuments(filters),
    ]);

    return sendSuccess(res, 200, "Tasks fetched successfully", {
      tasks,
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
    return sendError(res, 500, "Failed to fetch tasks", error.message);
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user._id,
    });

    return sendSuccess(res, 201, "Task created successfully", { task });
  } catch (error) {
    return sendError(res, 500, "Failed to create task", error.message);
  }
};

const getTaskById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Task not found");
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    return sendSuccess(res, 200, "Task fetched successfully", { task });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch task", error.message);
  }
};

const updateTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Task not found");
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    return sendSuccess(res, 200, "Task updated successfully", { task });
  } catch (error) {
    return sendError(res, 500, "Failed to update task", error.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Task not found");
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    return sendSuccess(res, 200, "Task deleted successfully", { taskId: task._id });
  } catch (error) {
    return sendError(res, 500, "Failed to delete task", error.message);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
