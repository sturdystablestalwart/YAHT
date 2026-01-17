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

const router = express.Router();

router.use(protect);

router.post("/", logCompletion);
router.get("/stats", getCompletionStats);
router.get("/daily-stats", getDailyStats);
router.get("/streaks", getStreaks);
router.get("/:habitId", getCompletions);
router.delete("/:habitId/today", deleteTodayCompletion);

export default router;
