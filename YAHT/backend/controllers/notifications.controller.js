import Habit from "../models/habits.model.js";
import User from "../models/user.model.js";
import Completion from "../models/completion.model.js";

const getPendingNotifications = async (req, res) => {
  const userId = req.user.id;
  const { currentTime, timezone } = req.query;

  try {
    // Get user notification settings
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if notifications are enabled
    if (!user.notificationSettings.enabled) {
      return res.status(200).json([]);
    }

    // Parse current time
    const now = currentTime ? new Date(currentTime) : new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTimeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    // Check if we're in quiet hours
    const { start: quietStart, end: quietEnd } = user.notificationSettings.quietHours;
    if (quietStart && quietEnd) {
      const isInQuietHours = isTimeInRange(currentTimeString, quietStart, quietEnd);
      if (isInQuietHours) {
        return res.status(200).json([]);
      }
    }

    // Get all active habits for this user with reminders enabled
    const habits = await Habit.find({
      userId,
      active: true,
      "reminderSettings.enabled": true,
    });

    // Filter habits that need reminders
    const pendingHabits = [];

    for (const habit of habits) {
      const reminderTime = habit.reminderSettings.time;
      const reminderDays = habit.reminderSettings.days;
      const lastSent = habit.reminderSettings.lastSent;

      // Check if reminder is scheduled for today
      if (!reminderDays.includes(currentDay)) {
        continue;
      }

      // Check if current time matches reminder time (within 1-minute window)
      if (!isTimeMatch(currentTimeString, reminderTime)) {
        continue;
      }

      // Check if reminder was sent in the last hour (prevent spam)
      if (lastSent) {
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (new Date(lastSent) > hourAgo) {
          continue;
        }
      }

      // Check if habit is already completed today
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const completion = await Completion.findOne({
        habitId: habit._id,
        userId,
        completedAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (completion) {
        continue;
      }

      // This habit needs a reminder
      pendingHabits.push({
        id: habit._id,
        title: habit.title,
        description: habit.description,
        reminderTime: habit.reminderSettings.time,
      });
    }

    res.status(200).json(pendingHabits);
  } catch (err) {
    console.error("Error fetching pending notifications:", err);
    res.status(500).json({
      message: "An error occurred while fetching pending notifications",
    });
  }
};

const markReminderSent = async (req, res) => {
  const userId = req.user.id;
  const { habitId } = req.body;

  try {
    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    habit.reminderSettings.lastSent = new Date();
    await habit.save();

    res.status(200).json({ message: "Reminder marked as sent" });
  } catch (err) {
    console.error("Error marking reminder as sent:", err);
    res.status(500).json({
      message: "An error occurred while marking reminder as sent",
    });
  }
};

// Helper function to check if current time matches reminder time (within 1-minute window)
const isTimeMatch = (currentTime, reminderTime) => {
  return currentTime === reminderTime;
};

// Helper function to check if time is within quiet hours range
const isTimeInRange = (currentTime, startTime, endTime) => {
  // Convert times to minutes for easier comparison
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  // Handle overnight ranges (e.g., 22:00 to 06:00)
  if (start > end) {
    return current >= start || current <= end;
  }

  return current >= start && current <= end;
};

export { getPendingNotifications, markReminderSent };
