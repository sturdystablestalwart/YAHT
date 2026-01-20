import { useState } from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Button,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { BsBellFill, BsBellSlashFill } from "react-icons/bs";
import { toaster } from "../ui/toaster.jsx";
import TimeInput from "../TimeInput.jsx";

function NotificationSettings() {
  const { permission, settings, requestPermission, updateSettings } = useNotification();
  const bgColor = useColorModeValue("#ffffff", "#2d2d2d");
  const textColor = useColorModeValue("#333333ff", "#cececeff");
  const borderColor = useColorModeValue("#e0e0e0", "#404040");

  const DEFAULT_QUIET_START = "22:00"; // 10 PM
  const DEFAULT_QUIET_END = "07:00";   // 7 AM

  const [enabled, setEnabled] = useState(settings.enabled);
  const [quietStart, setQuietStart] = useState(settings.quietHours?.start || "");
  const [quietEnd, setQuietEnd] = useState(settings.quietHours?.end || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleNotifications = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    // If enabling and permission not granted, request it
    if (newEnabled && permission !== "granted") {
      const result = await requestPermission();
      if (!result.success) {
        setEnabled(false);
        toaster.create({
          title: "Permission Required",
          description: "Please allow notifications in your browser settings.",
          type: "warning",
        });
        return;
      }
    }

    // Update settings
    setIsSaving(true);
    const result = await updateSettings({ enabled: newEnabled });
    setIsSaving(false);

    if (result.success) {
      toaster.create({
        title: "Settings Updated",
        description: `Notifications ${newEnabled ? "enabled" : "disabled"} successfully.`,
        type: "success",
      });
    } else {
      setEnabled(!newEnabled);
      toaster.create({
        title: "Error",
        description: result.error || "Failed to update settings.",
        type: "error",
      });
    }
  };

  const handleSaveQuietHours = async () => {
    setIsSaving(true);
    const result = await updateSettings({
      quietHoursStart: quietStart || null,
      quietHoursEnd: quietEnd || null,
    });
    setIsSaving(false);

    if (result.success) {
      toaster.create({
        title: "Settings Updated",
        description: "Quiet hours saved successfully.",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Error",
        description: result.error || "Failed to update quiet hours.",
        type: "error",
      });
    }
  };

  const handleResetQuietHours = async () => {
    setQuietStart(DEFAULT_QUIET_START);
    setQuietEnd(DEFAULT_QUIET_END);

    setIsSaving(true);
    const result = await updateSettings({
      quietHoursStart: DEFAULT_QUIET_START,
      quietHoursEnd: DEFAULT_QUIET_END,
    });
    setIsSaving(false);

    if (result.success) {
      toaster.create({
        title: "Settings Updated",
        description: "Quiet hours reset to default (22:00 - 07:00).",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Error",
        description: result.error || "Failed to reset quiet hours.",
        type: "error",
      });
    }
  };

  const handleClearQuietHours = async () => {
    setQuietStart("");
    setQuietEnd("");

    setIsSaving(true);
    const result = await updateSettings({
      quietHoursStart: null,
      quietHoursEnd: null,
    });
    setIsSaving(false);

    if (result.success) {
      toaster.create({
        title: "Settings Updated",
        description: "Quiet hours cleared.",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Error",
        description: result.error || "Failed to clear quiet hours.",
        type: "error",
      });
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.success) {
      toaster.create({
        title: "Permission Granted",
        description: "You can now receive notifications.",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Permission Denied",
        description: "Please allow notifications in your browser settings.",
        type: "warning",
      });
    }
  };

  const getPermissionColor = () => {
    if (permission === "granted") return "green.500";
    if (permission === "denied") return "red.500";
    return "gray.500";
  };

  const getPermissionText = () => {
    if (permission === "granted") return "Granted";
    if (permission === "denied") return "Denied";
    return "Not Set";
  };

  return (
    <Box
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="lg"
      p={6}
    >
      {/* Header */}
      <HStack gap={3} mb={6}>
        {enabled ? (
          <BsBellFill size={20} />
        ) : (
          <BsBellSlashFill size={20} />
        )}
        <Text color={textColor} fontSize="xl" fontWeight="bold">
          Notification Settings
        </Text>
      </HStack>

      {/* Body */}
      <VStack align="stretch" gap={5}>
        {/* Enable/Disable Toggle */}
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Text color={textColor} fontWeight="medium">
              Enable Notifications
            </Text>
            <Text color={textColor} fontSize="sm" opacity={0.7}>
              Receive reminders for your habits
            </Text>
          </VStack>
          <Button
            size="sm"
            colorPalette={enabled ? "green" : "gray"}
            variant={enabled ? "solid" : "outline"}
            onClick={handleToggleNotifications}
            disabled={isSaving}
          >
            {enabled ? "Enabled" : "Disabled"}
          </Button>
        </HStack>

        {/* Permission Status */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0}>
            <Text color={textColor} fontWeight="medium">
              Browser Permission
            </Text>
            <Text color={textColor} fontSize="sm" opacity={0.7}>
              Current notification permission status
            </Text>
          </VStack>
          <HStack gap={2}>
            <Text color={getPermissionColor()} fontWeight="medium" fontSize="sm">
              {getPermissionText()}
            </Text>
            {permission !== "granted" && (
              <Button size="sm" onClick={handleRequestPermission}>
                Request Permission
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Quiet Hours */}
        {enabled && (
          <Box>
            <Text color={textColor} fontWeight="medium" mb={2}>
              Quiet Hours
            </Text>
            <Text color={textColor} fontSize="sm" opacity={0.7} mb={3}>
              Don't send notifications during these hours
            </Text>
            <HStack gap={6}>
              <VStack align="start" gap={1}>
                <Text color={textColor} fontSize="sm">
                  Start Time (24h)
                </Text>
                <TimeInput
                  value={quietStart}
                  onChange={setQuietStart}
                  size="sm"
                />
              </VStack>
              <VStack align="start" gap={1}>
                <Text color={textColor} fontSize="sm">
                  End Time (24h)
                </Text>
                <TimeInput
                  value={quietEnd}
                  onChange={setQuietEnd}
                  size="sm"
                />
              </VStack>
            </HStack>
            <HStack mt={3} gap={2}>
              <Button
                size="sm"
                onClick={handleSaveQuietHours}
                loading={isSaving}
                loadingText="Saving..."
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetQuietHours}
                disabled={isSaving}
              >
                Reset to Default
              </Button>
              {(quietStart || quietEnd) && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={handleClearQuietHours}
                  disabled={isSaving}
                >
                  Clear
                </Button>
              )}
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default NotificationSettings;
