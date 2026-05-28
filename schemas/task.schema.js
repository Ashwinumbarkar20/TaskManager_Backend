const { z } = require("zod");

const taskStatusValues = ["pending", "in_progress", "completed"];
const taskPriorityValues = ["low", "medium", "high"];
const objectIdRegex = /^[a-f\d]{24}$/i;

const nullableDateString = z.preprocess(
  (value) => {
    if (value === "" || value === undefined) {
      return null;
    }
    return value;
  },
  z.string().datetime().nullable()
);

const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(taskStatusValues, { message: "Invalid status" }).optional(),
  priority: z.enum(taskPriorityValues, { message: "Invalid priority" }).optional(),
  dueDate: nullableDateString.optional(),
});

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title must be at most 200 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description must be at most 1000 characters")
      .optional(),
    status: z.enum(taskStatusValues, { message: "Invalid status" }).optional(),
    priority: z
      .enum(taskPriorityValues, { message: "Invalid priority" })
      .optional(),
    dueDate: nullableDateString.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

const taskIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid task id"),
});

const listTaskQuerySchema = z.object({
  status: z.enum(taskStatusValues, { message: "Invalid status" }).optional(),
  priority: z.enum(taskPriorityValues, { message: "Invalid priority" }).optional(),
  search: z.string().trim().min(1, "Search must not be empty").optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "dueDate", "title", "priority", "status"], {
      message: "Invalid sortBy field",
    })
    .optional(),
  sortOrder: z.enum(["asc", "desc"], { message: "Invalid sortOrder" }).optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
  listTaskQuerySchema,
};
