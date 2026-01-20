import express from "express";
import { getPendingNotifications, markReminderSent } from "../controllers/notifications.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/pending", protect, getPendingNotifications);
router.post("/mark-sent", protect, markReminderSent);

export default router;
