import Habit from "../models/habits.model.js";
import { parseFrequency } from "../utils/frequency.js";

const getAHabit = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      return res.status(404).json({ message: "No habit with such id found" });
    }
    res.status(200).json(habit);
  } catch (err) {
    console.error("Error fetching a habit:", err);
    res.status(500).json({ message: "An error occurred while fetching the habit." });
  }
};

const getAllHabits = async (req, res) => {
  const userId = req.user.id;

  try {
    const habits = await Habit.find({ userId });
    res.status(200).json(habits);
  } catch (err) {
    console.error("Error fetching habits:", err);
    res.status(500).json({ message: "An error occurred while fetching habits." });
  }
};

const postHabit = async (req, res) => {
  const habit = req.body;
  const userId = req.user.id;

  // Validate required fields
  const missingData = [];
  if (!habit.title) missingData.push("title");
  if (!habit.frequency) missingData.push("frequency");
  if (habit.active === undefined) missingData.push("active");

  if (missingData.length > 0) {
    return res.status(400).json({
      message: "Invalid habit data. Please add data to the: " + missingData.join(", "),
    });
  }

  try {
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
    // Check if it's a validation error from parseFrequency
    if (
      err.message.includes("Invalid") ||
      err.message.includes("must be") ||
      err.message.includes("Target")
    ) {
      return res.status(400).json({ message: err.message });
    }
    console.error("Error creating habit:", err);
    res.status(500).json({ message: "An error occurred, no new habit saved" });
  }
};

const deleteHabit = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deletedHabit = await Habit.findOneAndDelete({ _id: id, userId });
    if (!deletedHabit) {
      return res.status(404).json({ message: "No habit with such id found" });
    }
    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (err) {
    console.error("Error deleting habit:", err);
    res.status(500).json({ message: "An error occurred while deleting the habit." });
  }
};

const putHabit = async (req, res) => {
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
      return res.status(404).json({ message: "No habit with such id found" });
    }
    res.status(200).json(habit);
  } catch (err) {
    // Check if it's a validation error from parseFrequency
    if (
      err.message.includes("Invalid") ||
      err.message.includes("must be") ||
      err.message.includes("Target")
    ) {
      return res.status(400).json({ message: err.message });
    }
    console.error("Error updating habit:", err);
    res.status(500).json({ message: "An error occurred while updating the habit." });
  }
};

export { getAllHabits, postHabit, deleteHabit, getAHabit, putHabit };
