import express from "express";
import {
  getSummary,
  getCalendar,
  getTrends,
  getTimeHeatmap,
} from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/calendar", getCalendar);
router.get("/trends", getTrends);
router.get("/time-heatmap", getTimeHeatmap);

export default router;
