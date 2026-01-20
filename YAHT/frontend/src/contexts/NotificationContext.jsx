import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permission, setPermission] = useState("default");
  const [settings, setSettings] = useState({
    enabled: false,
    permission: "default",
    quietHours: {
      start: null,
      end: null,
    },
  });
  const [loading, setLoading] = useState(true);

  // Initialize notification permission and settings from user data
  useEffect(() => {
    if (isAuthenticated && user) {
      // Get browser permission status
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }

      // Load user settings if available
      if (user.notificationSettings) {
        setSettings(user.notificationSettings);
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications");
      return { success: false, error: "Notifications not supported" };
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      // Update backend with permission status
      if (isAuthenticated) {
        await updateSettings({ permission: result });
      }

      return { success: result === "granted", permission: result };
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return { success: false, error: err.message };
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const data = await authAPI.updateNotificationSettings(newSettings);

      if (data.user && data.user.notificationSettings) {
        setSettings(data.user.notificationSettings);
      }

      return { success: true };
    } catch (err) {
      console.error("Error updating notification settings:", err);
      return { success: false, error: err.message };
    }
  };

  const checkPermission = () => {
    if ("Notification" in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      return currentPermission;
    }
    return "default";
  };

  const canShowNotifications = () => {
    return (
      "Notification" in window &&
      permission === "granted" &&
      settings.enabled
    );
  };

  const value = {
    permission,
    settings,
    loading,
    requestPermission,
    updateSettings,
    checkPermission,
    canShowNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
