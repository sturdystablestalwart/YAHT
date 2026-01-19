import mongoose from "mongoose";
import Completion from "../models/completion.model.js";
import Habit from "../models/habits.model.js";
import {
  getPeriodStart,
  getPeriodEnd,
  getPeriodKey,
  getPreviousPeriodStart,
  parseFrequency,
} from "../utils/frequency.js";

// Helper to safely get frequency from habit (handles both old string and new object format)
const getHabitFrequency = (habit) => {
  try {
    return parseFrequency(habit.frequency);
  } catch {
    // Default fallback if parsing fails
    return { target: 1, period: "day" };
  }
};

const logCompletion = async (req, res) => {
  const { habitId } = req.body;
  const userId = req.user.id;

  if (!habitId) {
    return res.status(400).json({ message: "habitId is required" });
  }

  try {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const completion = new Completion({
      habitId,
      userId,
      completedAt: new Date(),
    });

    await completion.save();
    res.status(201).json(completion);
  } catch (err) {
    console.error("Error logging completion:", err);
    res
      .status(500)
      .json({ message: "An error occurred while logging completion." });
  }
};

const deleteTodayCompletion = async (req, res) => {
  const { habitId } = req.params;
  const userId = req.user.id;

  try {
    // Get the habit to determine its period
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const { period } = getHabitFrequency(habit);
    const now = new Date();
    const periodStart = getPeriodStart(now, period);
    const periodEnd = getPeriodEnd(now, period);

    // Delete the most recent completion in the current period
    const deleted = await Completion.findOneAndDelete({
      habitId,
      userId,
      completedAt: { $gte: periodStart, $lt: periodEnd },
    }).sort({ completedAt: -1 });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "No completion found for current period" });
    }

    res.status(200).json({ message: "Completion removed" });
  } catch (err) {
    console.error("Error deleting completion:", err);
    res
      .status(500)
      .json({ message: "An error occurred while deleting completion." });
  }
};

const getCompletions = async (req, res) => {
  const { habitId } = req.params;
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  try {
    const query = { habitId, userId };

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) {
        query.completedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.completedAt.$lte = new Date(endDate);
      }
    }

    const completions = await Completion.find(query).sort({ completedAt: -1 });
    res.status(200).json(completions);
  } catch (err) {
    console.error("Error fetching completions:", err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching completions." });
  }
};

const getCompletionStats = async (req, res) => {
  const userId = req.user.id;
  const { days = 7 } = req.query;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const stats = await Completion.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completedAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "habits",
          localField: "habitId",
          foreignField: "_id",
          as: "habit",
        },
      },
      {
        $unwind: "$habit",
      },
      {
        $group: {
          _id: "$habitId",
          habitTitle: { $first: "$habit.title" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error("Error fetching completion stats:", err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching stats." });
  }
};

const getDailyStats = async (req, res) => {
  const userId = req.user.id;
  const { days = 5 } = req.query;
  const numDays = parseInt(days);

  const toDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  try {
    // Get all active habits for the user
    const habits = await Habit.find({ userId, active: true });

    // Generate array of last N days
    const dateLabels = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateLabels.push(toDateString(date));
    }

    // Get completions for the date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays + 1);
    startDate.setHours(0, 0, 0, 0);

    const completions = await Completion.find({
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: startDate },
    });

    // Group completions by habitId and date
    const completionMap = {};
    completions.forEach((c) => {
      const dateStr = toDateString(c.completedAt);
      const habitId = c.habitId.toString();
      if (!completionMap[habitId]) {
        completionMap[habitId] = {};
      }
      completionMap[habitId][dateStr] = (completionMap[habitId][dateStr] || 0) + 1;
    });

    // Build series data for each habit
    const series = habits.map((habit) => {
      const habitCompletions = completionMap[habit._id.toString()] || {};
      const data = dateLabels.map((date) => habitCompletions[date] || 0);
      return {
        name: habit.title,
        data,
      };
    });

    res.status(200).json({
      categories: dateLabels,
      series,
    });
  } catch (err) {
    console.error("Error fetching daily stats:", err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching daily stats." });
  }
};

const getStreaks = async (req, res) => {
  const userId = req.user.id;

  try {
    const habits = await Habit.find({ userId, active: true });
    const streaks = {};

    for (const habit of habits) {
      const { target, period } = getHabitFrequency(habit);

      const completions = await Completion.find({
        habitId: habit._id,
        userId,
      }).sort({ completedAt: -1 });

      const now = new Date();
      const currentPeriodStart = getPeriodStart(now, period);
      const currentPeriodEnd = getPeriodEnd(now, period);

      // Count completions in current period
      const currentPeriodCompletions = completions.filter((c) => {
        const t = new Date(c.completedAt).getTime();
        return t >= currentPeriodStart.getTime() && t < currentPeriodEnd.getTime();
      });
      const currentCount = currentPeriodCompletions.length;
      const periodComplete = currentCount >= target;

      // Build a map of period -> completion count for efficiency
      const periodCounts = {};
      completions.forEach((c) => {
        const key = getPeriodKey(c.completedAt, period);
        periodCounts[key] = (periodCounts[key] || 0) + 1;
      });

      // Calculate streak: count consecutive periods meeting target
      let streak = 0;
      let checkPeriodStart = periodComplete
        ? currentPeriodStart
        : getPreviousPeriodStart(currentPeriodStart, period);

      while (true) {
        const periodKey = getPeriodKey(checkPeriodStart, period);
        const count = periodCounts[periodKey] || 0;

        if (count >= target) {
          streak++;
          checkPeriodStart = getPreviousPeriodStart(checkPeriodStart, period);
        } else {
          break;
        }

        // Safety limit to prevent infinite loops
        if (streak > 1000) break;
      }

      streaks[habit._id] = {
        streak,
        periodComplete,
        currentCount,
        target,
        period,
      };
    }

    res.status(200).json(streaks);
  } catch (err) {
    console.error("Error fetching streaks:", err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching streaks." });
  }
};

export {
  logCompletion,
  deleteTodayCompletion,
  getCompletions,
  getCompletionStats,
  getDailyStats,
  getStreaks,
};
