const express = require("express");
const {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
} = require("../controllers/admin.controller");
const { ValidateToken, requireAdmin } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  adminUsersQuerySchema,
  updateUserStatusParamsSchema,
  updateUserStatusBodySchema,
} = require("../schemas/admin.schema");

const router = express.Router();

router.use(ValidateToken, requireAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/users", validate({ query: adminUsersQuerySchema }), getUsers);
router.patch(
  "/users/:userId/status",
  validate({
    params: updateUserStatusParamsSchema,
    body: updateUserStatusBodySchema,
  }),
  updateUserStatus
);

module.exports = router;
