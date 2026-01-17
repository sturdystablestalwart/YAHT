import express from "express";
import {
  getAllHabits,
  postHabit,
  deleteHabit,
  getAHabit,
  putHabit,
} from "../controllers/habit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllHabits);
router.get("/:id", getAHabit);
router.post("/", postHabit);
router.delete("/:id", deleteHabit);
router.put("/:id", putHabit);

export default router;
