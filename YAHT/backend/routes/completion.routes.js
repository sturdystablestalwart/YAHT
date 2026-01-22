import express from "express";
import {
  logCompletion,
  deleteTodayCompletion,
  getCompletions,
  getCompletionStats,
  getDailyStats,
  getStreaks,
} from "../controllers/completion.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  logCompletionSchema,
  deleteCompletionSchema,
  getCompletionsSchema,
  statsQuerySchema,
  dailyStatsQuerySchema,
} from "../schemas/completion.schema.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(logCompletionSchema), logCompletion);
router.get("/stats", validate(statsQuerySchema), getCompletionStats);
router.get("/daily-stats", validate(dailyStatsQuerySchema), getDailyStats);
router.get("/streaks", getStreaks);
router.get("/:habitId", validate(getCompletionsSchema), getCompletions);
router.delete("/:habitId/today", validate(deleteCompletionSchema), deleteTodayCompletion);

export default router;
