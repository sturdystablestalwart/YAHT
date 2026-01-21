import { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Text,
  HStack,
  VStack,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { BsBellFill } from "react-icons/bs";
import { colors } from "../../theme/colors.js";

function NotificationPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const { permission, requestPermission, updateSettings } = useNotification();
  const bgColor = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("notificationPromptDismissed");
    const permanentlyDismissed = localStorage.getItem("notificationPromptPermanentlyDismissed");

    // Show prompt only if not dismissed and permission is default
    if (!dismissed && !permanentlyDismissed && permission === "default") {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [permission]);

  const handleEnable = async () => {
    setIsRequesting(true);
    const result = await requestPermission();

    if (result.success) {
      // Enable notifications in backend
      await updateSettings({ enabled: true, permission: result.permission });
    }

    setIsRequesting(false);
    setIsOpen(false);
  };

  const handleMaybeLater = () => {
    localStorage.setItem("notificationPromptDismissed", "true");
    setIsOpen(false);
  };

  const handleDontAskAgain = () => {
    localStorage.setItem("notificationPromptPermanentlyDismissed", "true");
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleMaybeLater()}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content bg={bgColor} p={6} borderRadius="lg" maxW="450px">
            <Dialog.Header p={0} mb={4}>
              <HStack gap={3}>
                <BsBellFill size={24} color={textColor} />
                <Dialog.Title color={textColor} fontSize="lg" fontWeight="bold">
                  Enable Habit Reminders
                </Dialog.Title>
              </HStack>
            </Dialog.Header>
            <Dialog.Body p={0} mb={6}>
              <VStack align="start" gap={3}>
                <Text color={textColor}>
                  Stay on track with your habits by enabling notifications.
                </Text>
                <Text color={textColor} fontSize="sm">
                  You'll receive:
                </Text>
                <VStack align="start" pl={4} gap={1}>
                  <Text color={textColor} fontSize="sm">
                    • Daily reminders at your chosen times
                  </Text>
                  <Text color={textColor} fontSize="sm">
                    • Streak milestone celebrations
                  </Text>
                  <Text color={textColor} fontSize="sm">
                    • Gentle encouragement to stay consistent
                  </Text>
                </VStack>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer p={0}>
              <VStack w="100%" gap={2}>
                <HStack justify="flex-end" gap={3} w="100%">
                  <Button
                    variant="ghost"
                    onClick={handleDontAskAgain}
                    disabled={isRequesting}
                    size="sm"
                  >
                    Don't Ask Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMaybeLater}
                    disabled={isRequesting}
                  >
                    Maybe Later
                  </Button>
                  <Button
                    colorPalette="blue"
                    onClick={handleEnable}
                    loading={isRequesting}
                    loadingText="Enabling..."
                  >
                    Enable Notifications
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default NotificationPrompt;
