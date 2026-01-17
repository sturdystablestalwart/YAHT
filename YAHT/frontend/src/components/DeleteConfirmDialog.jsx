import {
  Dialog,
  Button,
  Text,
  HStack,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode.jsx";

function DeleteConfirmDialog({ isOpen, onClose, onConfirm, habitName, isDeleting }) {
  const bgColor = useColorModeValue("#f5f5f5", "#1a1a1a");
  const textColor = useColorModeValue("#333333ff", "#cececeff");

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content bg={bgColor} p={6} borderRadius="lg" maxW="400px">
            <Dialog.Header p={0} mb={4}>
              <Dialog.Title color={textColor} fontSize="lg" fontWeight="bold">
                Delete Habit
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={0} mb={6}>
              <Text color={textColor}>
                Are you sure you want to delete "<strong>{habitName}</strong>"? This action cannot be undone.
              </Text>
            </Dialog.Body>
            <Dialog.Footer p={0}>
              <HStack justify="flex-end" gap={3}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="red"
                  onClick={onConfirm}
                  loading={isDeleting}
                  loadingText="Deleting..."
                >
                  Delete
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default DeleteConfirmDialog;
