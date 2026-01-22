import express from "express";
import {
  getAllHabits,
  postHabit,
  deleteHabit,
  getAHabit,
  putHabit,
} from "../controllers/habit.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdParamSchema,
} from "../schemas/habit.schema.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllHabits);
router.get("/:id", validate(habitIdParamSchema), getAHabit);
router.post("/", validate(createHabitSchema), postHabit);
router.delete("/:id", validate(habitIdParamSchema), deleteHabit);
router.put("/:id", validate(updateHabitSchema), putHabit);

export default router;
