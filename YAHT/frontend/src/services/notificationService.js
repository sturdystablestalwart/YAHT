class NotificationService {
  constructor() {
    this.isSupported = "Notification" in window;
  }

  // Request browser permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error("Notifications are not supported in this browser");
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Check current permission status
  getPermissionStatus() {
    if (!this.isSupported) {
      return "unsupported";
    }
    return Notification.permission;
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn("Notifications are not supported");
      return null;
    }

    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      return notification;
    } catch (err) {
      console.error("Error showing notification:", err);
      return null;
    }
  }

  // Format habit into notification
  formatHabitNotification(habit) {
    return {
      title: `Time to track: ${habit.title}`,
      options: {
        body: "Don't forget to complete your habit today!",
        tag: `habit-${habit.id}`,
        requireInteraction: false,
        silent: false,
      },
    };
  }

  // Format streak milestone notification
  formatStreakNotification(habit, streak) {
    return {
      title: `🔥 ${streak} day streak!`,
      options: {
        body: `You're doing great with ${habit.title}!`,
        tag: `streak-${habit.id}`,
        requireInteraction: false,
        silent: false,
      },
    };
  }

  // Format end of day reminder
  formatEndOfDayNotification(habit) {
    return {
      title: "Almost missed!",
      options: {
        body: `You haven't completed ${habit.title} today.`,
        tag: `eod-${habit.id}`,
        requireInteraction: false,
        silent: false,
      },
    };
  }

  // Check if notifications can be shown
  canShowNotifications() {
    return this.isSupported && Notification.permission === "granted";
  }
}

export default new NotificationService();
