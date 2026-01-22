import Habit from "../models/habits.model.js";
import { parseFrequency } from "../utils/frequency.js";
import { AppError } from "../utils/AppError.js";

const getAHabit = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      throw new AppError("No habit with such id found", 404);
    }
    res.status(200).json(habit);
  } catch (err) {
    next(err);
  }
};

const getAllHabits = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const habits = await Habit.find({ userId });
    res.status(200).json(habits);
  } catch (err) {
    next(err);
  }
};

const postHabit = async (req, res, next) => {
  const habit = req.body;
  const userId = req.user.id;

  try {
    // Validation handled by middleware
    // Parse and validate frequency
    const frequency = parseFrequency(habit.frequency);

    const newHabit = new Habit({
      ...habit,
      frequency,
      userId,
    });

    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    next(err);
  }
};

const deleteHabit = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deletedHabit = await Habit.findOneAndDelete({ _id: id, userId });
    if (!deletedHabit) {
      throw new AppError("No habit with such id found", 404);
    }
    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const putHabit = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const update = req.body;

  try {
    // Parse frequency if it's being updated
    if (update.frequency) {
      update.frequency = parseFrequency(update.frequency);
    }

    const habit = await Habit.findOneAndUpdate({ _id: id, userId }, update, {
      new: true,
    });

    if (!habit) {
      throw new AppError("No habit with such id found", 404);
    }
    res.status(200).json(habit);
  } catch (err) {
    next(err);
  }
};

export { getAllHabits, postHabit, deleteHabit, getAHabit, putHabit };
