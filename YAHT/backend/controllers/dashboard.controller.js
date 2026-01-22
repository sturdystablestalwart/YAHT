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

// Helper to safely get frequency from habit
const getHabitFrequency = (habit) => {
  try {
    return parseFrequency(habit.frequency);
  } catch {
    return { target: 1, period: "day" };
  }
};

// Parse range string (e.g., "30d") to number of days
const parseRange = (range) => {
  const match = range?.match(/^(\d+)d$/);
  return match ? parseInt(match[1], 10) : 30;
};

// Get date string in YYYY-MM-DD format
const toDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Calculate longest streak by walking through all historical periods
const calculateLongestStreak = (completions, target, period) => {
  if (completions.length === 0) return 0;

  // Build a map of period -> completion count
  const periodCounts = {};
  completions.forEach((c) => {
    const key = getPeriodKey(c.completedAt, period);
    periodCounts[key] = (periodCounts[key] || 0) + 1;
  });

  // Get all unique periods sorted
  const periods = Object.keys(periodCounts).sort();
  if (periods.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 0;

  // Walk through periods chronologically
  const firstCompletion = new Date(
    Math.min(...completions.map((c) => new Date(c.completedAt).getTime()))
  );
  const now = new Date();

  let checkDate = getPeriodStart(firstCompletion, period);
  const endDate = getPeriodEnd(now, period);

  while (checkDate < endDate) {
    const periodKey = getPeriodKey(checkDate, period);
    const count = periodCounts[periodKey] || 0;

    if (count >= target) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    // Move to next period
    switch (period) {
      case "day":
        checkDate.setDate(checkDate.getDate() + 1);
        break;
      case "week":
        checkDate.setDate(checkDate.getDate() + 7);
        break;
      case "month":
        checkDate.setMonth(checkDate.getMonth() + 1);
        break;
    }

    // Safety limit
    if (currentStreak > 10000) break;
  }

  return longestStreak;
};

// Calculate current streak
const calculateCurrentStreak = (completions, target, period) => {
  if (completions.length === 0) return 0;

  const periodCounts = {};
  completions.forEach((c) => {
    const key = getPeriodKey(c.completedAt, period);
    periodCounts[key] = (periodCounts[key] || 0) + 1;
  });

  const now = new Date();
  const currentPeriodStart = getPeriodStart(now, period);
  const currentPeriodKey = getPeriodKey(now, period);
  const currentCount = periodCounts[currentPeriodKey] || 0;
  const periodComplete = currentCount >= target;

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

    if (streak > 1000) break;
  }

  return streak;
};

// GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  const userId = req.user.id;
  const { range = "30d" } = req.query;
  const days = parseRange(range);

  try {
    const habits = await Habit.find({ userId, active: true });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all completions for range
    const completions = await Completion.find({
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: startDate },
    });

    // Get all historical completions for streak calculation
    const allCompletions = await Completion.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Group completions by habitId
    const completionsByHabit = {};
    const allCompletionsByHabit = {};

    completions.forEach((c) => {
      const habitId = c.habitId.toString();
      if (!completionsByHabit[habitId]) completionsByHabit[habitId] = [];
      completionsByHabit[habitId].push(c);
    });

    allCompletions.forEach((c) => {
      const habitId = c.habitId.toString();
      if (!allCompletionsByHabit[habitId]) allCompletionsByHabit[habitId] = [];
      allCompletionsByHabit[habitId].push(c);
    });

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const habitsData = habits.map((habit) => {
      const { target, period } = getHabitFrequency(habit);
      const habitId = habit._id.toString();
      const habitCompletions = completionsByHabit[habitId] || [];
      const allHabitCompletions = allCompletionsByHabit[habitId] || [];

      // Calculate streaks
      const currentStreak = calculateCurrentStreak(allHabitCompletions, target, period);
      const longestStreak = calculateLongestStreak(allHabitCompletions, target, period);

      // Calculate completion rate for range
      let totalPeriods = 0;
      let completedPeriods = 0;

      const periodCounts = {};
      habitCompletions.forEach((c) => {
        const key = getPeriodKey(c.completedAt, period);
        periodCounts[key] = (periodCounts[key] || 0) + 1;
      });

      // Count periods in range
      let checkDate = new Date(startDate);
      while (checkDate <= now) {
        totalPeriods++;
        const key = getPeriodKey(checkDate, period);
        if ((periodCounts[key] || 0) >= target) {
          completedPeriods++;
        }
        switch (period) {
          case "day":
            checkDate.setDate(checkDate.getDate() + 1);
            break;
          case "week":
            checkDate.setDate(checkDate.getDate() + 7);
            break;
          case "month":
            checkDate.setMonth(checkDate.getMonth() + 1);
            break;
        }
      }

      const completionRate =
        totalPeriods > 0 ? Math.round((completedPeriods / totalPeriods) * 100) : 0;

      // Current period status
      const currentPeriodStart = getPeriodStart(now, period);
      const currentPeriodEnd = getPeriodEnd(now, period);
      const currentPeriodCompletions = allHabitCompletions.filter((c) => {
        const t = new Date(c.completedAt).getTime();
        return t >= currentPeriodStart.getTime() && t < currentPeriodEnd.getTime();
      });
      const currentCount = currentPeriodCompletions.length;
      const periodComplete = currentCount >= target;

      // Status: done (met target), at-risk (streak might break), due (not done yet)
      let status = "due";
      if (periodComplete) {
        status = "done";
      } else if (currentStreak > 0 && currentStreak <= 2) {
        status = "at-risk";
      }

      return {
        _id: habit._id,
        title: habit.title,
        currentStreak,
        longestStreak,
        completionRate,
        status,
        periodComplete,
        currentCount,
        target,
        period,
      };
    });

    // Calculate overall completion rate
    const totalRates = habitsData.reduce((sum, h) => sum + h.completionRate, 0);
    const overallRate = habitsData.length > 0 ? Math.round(totalRates / habitsData.length) : 0;

    // Today's focus - habits sorted by risk
    const todayFocus = habitsData
      .filter((h) => h.status !== "done")
      .map((h) => {
        // Risk score: 1 = low, 2 = medium, 3 = high
        let riskScore = 1;
        let reason = "Due today";

        if (h.currentStreak > 0 && h.currentStreak <= 2) {
          riskScore = 3;
          reason = "Streak will break";
        } else if (h.currentStreak > 2 && h.currentStreak <= 5) {
          riskScore = 2;
          reason = `${h.currentStreak}-${h.period} streak at risk`;
        }

        // Check day-of-week patterns using all completions
        const allHabitCompletions = allCompletionsByHabit[h._id.toString()] || [];
        const dayCompletions = allHabitCompletions.filter(
          (c) => new Date(c.completedAt).getDay() === dayOfWeek
        );
        const totalDaysOfThisType = Math.ceil(days / 7);
        if (dayCompletions.length < totalDaysOfThisType * 0.5) {
          if (riskScore < 2) {
            riskScore = 2;
            reason = `Often missed on ${dayNames[dayOfWeek]}s`;
          }
        }

        return {
          _id: h._id,
          title: h.title,
          riskScore,
          reason,
          dueBy: null,
          currentCount: h.currentCount,
          target: h.target,
          period: h.period,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    res.status(200).json({
      habits: habitsData,
      overallRate,
      todayFocus,
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    res.status(500).json({ message: "An error occurred while fetching dashboard summary." });
  }
};

// GET /api/dashboard/calendar
export const getCalendar = async (req, res) => {
  const userId = req.user.id;
  const { weeks = 12, habitId } = req.query;
  const numWeeks = parseInt(weeks, 10);

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numWeeks * 7);
    startDate.setHours(0, 0, 0, 0);

    // Get habits (filter by habitId if provided)
    const habitQuery = { userId, active: true };
    if (habitId) {
      habitQuery._id = new mongoose.Types.ObjectId(habitId);
    }
    const habits = await Habit.find(habitQuery);

    // Get completions
    const completionQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: startDate },
    };
    if (habitId) {
      completionQuery.habitId = new mongoose.Types.ObjectId(habitId);
    }
    const completions = await Completion.find(completionQuery);

    // Group completions by date
    const completionsByDate = {};
    completions.forEach((c) => {
      const date = toDateString(c.completedAt);
      if (!completionsByDate[date]) completionsByDate[date] = [];
      completionsByDate[date].push(c);
    });

    // Generate data for each day
    const data = [];
    const totalHabits = habits.length;
    const now = new Date();

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const date = toDateString(d);
      const dayCompletions = completionsByDate[date] || [];

      // Count unique habits completed
      const uniqueHabits = new Set(dayCompletions.map((c) => c.habitId.toString()));
      const completed = uniqueHabits.size;

      // Calculate intensity (0-4)
      let intensity = 0;
      if (totalHabits > 0) {
        const rate = completed / totalHabits;
        if (rate > 0) intensity = 1;
        if (rate >= 0.25) intensity = 1;
        if (rate >= 0.5) intensity = 2;
        if (rate >= 0.75) intensity = 3;
        if (rate >= 1) intensity = 4;
      }

      data.push({
        date,
        intensity,
        completed,
        total: totalHabits,
      });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching calendar data:", err);
    res.status(500).json({ message: "An error occurred while fetching calendar data." });
  }
};

// GET /api/dashboard/trends
export const getTrends = async (req, res) => {
  const userId = req.user.id;
  const { range = "90d", habitId } = req.query;
  const days = parseRange(range);

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get habits
    const habitQuery = { userId, active: true };
    if (habitId) {
      habitQuery._id = new mongoose.Types.ObjectId(habitId);
    }
    const habits = await Habit.find(habitQuery);

    // Get completions
    const completionQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: startDate },
    };
    if (habitId) {
      completionQuery.habitId = new mongoose.Types.ObjectId(habitId);
    }
    const completions = await Completion.find(completionQuery);

    // Group completions by date
    const completionsByDate = {};
    completions.forEach((c) => {
      const date = toDateString(c.completedAt);
      if (!completionsByDate[date]) completionsByDate[date] = [];
      completionsByDate[date].push(c);
    });

    const totalHabits = habits.length;
    const data = [];
    const now = new Date();

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const date = toDateString(d);
      const dayCompletions = completionsByDate[date] || [];
      const uniqueHabits = new Set(dayCompletions.map((c) => c.habitId.toString()));
      const completed = uniqueHabits.size;
      const rate = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;

      data.push({
        date,
        completed,
        total: totalHabits,
        rate,
      });
    }

    // Calculate 7-day rolling average
    const rollingAverage = data.map((d, i) => {
      const start = Math.max(0, i - 6);
      const window = data.slice(start, i + 1);
      const avgRate = Math.round(window.reduce((sum, w) => sum + w.rate, 0) / window.length);
      return { date: d.date, rate: avgRate };
    });

    res.status(200).json({ data, rollingAverage });
  } catch (err) {
    console.error("Error fetching trends data:", err);
    res.status(500).json({ message: "An error occurred while fetching trends data." });
  }
};

// GET /api/dashboard/time-heatmap
export const getTimeHeatmap = async (req, res) => {
  const userId = req.user.id;
  const { range = "30d", habitId } = req.query;
  const days = parseRange(range);

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get habits
    const habitQuery = { userId, active: true };
    if (habitId) {
      habitQuery._id = new mongoose.Types.ObjectId(habitId);
    }
    const habits = await Habit.find(habitQuery);

    // Get completions
    const completionQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: startDate },
    };
    if (habitId) {
      completionQuery.habitId = new mongoose.Types.ObjectId(habitId);
    }
    const completions = await Completion.find(completionQuery);

    // Build habit name lookup
    const habitNames = {};
    habits.forEach((h) => {
      habitNames[h._id.toString()] = h.title;
    });

    // Hours from 5 AM to 11 PM
    const hours = Array.from({ length: 19 }, (_, i) => i + 5);

    // Build matrix: habits × hours
    const habitIds = habits.map((h) => h._id.toString());
    const matrix = habitIds.map((hId) => {
      return hours.map((hour) => {
        const count = completions.filter((c) => {
          const cHour = new Date(c.completedAt).getHours();
          return c.habitId.toString() === hId && cHour === hour;
        }).length;
        return count;
      });
    });

    res.status(200).json({
      habits: habits.map((h) => h.title),
      hours,
      matrix,
    });
  } catch (err) {
    console.error("Error fetching time heatmap data:", err);
    res.status(500).json({ message: "An error occurred while fetching time heatmap data." });
  }
};
