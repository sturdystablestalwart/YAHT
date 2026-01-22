import express from "express";
import {
  register,
  login,
  getMe,
  updateNotificationSettings,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateNotificationSettingsSchema,
} from "../schemas/auth.schema.js";
import { authLimiter } from "../config/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", protect, getMe);
router.patch(
  "/notification-settings",
  protect,
  validate(updateNotificationSettingsSchema),
  updateNotificationSettings
);

export default router;
