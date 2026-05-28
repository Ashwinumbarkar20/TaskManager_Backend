const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;

const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1, "Search must not be empty").optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const updateUserStatusParamsSchema = z.object({
  userId: z.string().regex(objectIdRegex, "Invalid user id"),
});

const updateUserStatusBodySchema = z.object({
  isActive: z.boolean({
    required_error: "isActive is required",
  }),
});

module.exports = {
  adminUsersQuerySchema,
  updateUserStatusParamsSchema,
  updateUserStatusBodySchema,
};
