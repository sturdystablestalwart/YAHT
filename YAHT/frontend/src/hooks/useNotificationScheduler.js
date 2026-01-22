import { useEffect, useRef } from "react";
import { useNotification } from "../contexts/NotificationContext.jsx";
import { notificationsAPI } from "../services/api.js";
import notificationService from "../services/notificationService.js";

const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

export const useNotificationScheduler = () => {
  const { canShowNotifications } = useNotification();
  const intervalRef = useRef(null);
  const shownNotificationsRef = useRef(new Set());

  useEffect(() => {
    // Only run if notifications are enabled and permitted
    if (!canShowNotifications()) {
      return;
    }

    const checkAndShowNotifications = async () => {
      try {
        const currentTime = new Date().toISOString();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Fetch pending notifications from backend
        const pendingHabits = await notificationsAPI.getPending(currentTime, timezone);

        // Show notification for each pending habit
        for (const habit of pendingHabits) {
          // Skip if we've already shown this notification recently
          const notificationKey = `${habit.id}-${new Date().toDateString()}`;
          if (shownNotificationsRef.current.has(notificationKey)) {
            continue;
          }

          // Format and show notification
          const { title, options } = notificationService.formatHabitNotification(habit);
          const notification = notificationService.showNotification(title, options);

          if (notification) {
            // Track that we've shown this notification
            shownNotificationsRef.current.add(notificationKey);

            // Handle notification click
            notification.onclick = () => {
              window.focus();
              notification.close();
              // Navigate to home page where habits are shown
              if (window.location.pathname !== "/") {
                window.location.href = "/";
              }
            };

            // Mark as sent in backend
            try {
              await notificationsAPI.markSent(habit.id);
            } catch (err) {
              console.error("Failed to mark notification as sent:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error checking notifications:", err);
        // Don't show error to user, just log it
      }
    };

    // Run immediately on mount
    checkAndShowNotifications();

    // Set up interval to check periodically
    intervalRef.current = setInterval(checkAndShowNotifications, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [canShowNotifications]);

  // Clean up shown notifications set every day
  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        shownNotificationsRef.current.clear();
      },
      24 * 60 * 60 * 1000
    ); // Every 24 hours

    return () => clearInterval(cleanupInterval);
  }, []);
};
