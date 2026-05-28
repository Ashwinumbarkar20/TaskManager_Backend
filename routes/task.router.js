const express = require("express");
const { ValidateToken } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
  listTaskQuerySchema,
} = require("../schemas/task.schema");
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

const router = express.Router();

router.use(ValidateToken);

router.get("/", validate({ query: listTaskQuerySchema }), getTasks);

router.post("/", validate(createTaskSchema), createTask);

router.get("/:id", validate({ params: taskIdParamsSchema }), getTaskById);

router.put(
  "/:id",
  validate({ params: taskIdParamsSchema, body: updateTaskSchema }),
  updateTask
);

router.delete("/:id", validate({ params: taskIdParamsSchema }), deleteTask);

module.exports = router;
