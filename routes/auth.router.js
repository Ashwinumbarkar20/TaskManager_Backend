const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { ValidateToken } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", ValidateToken, me);

module.exports = router;
