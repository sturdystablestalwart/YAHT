import { useState } from "react";
import { Dialog, Flex, Portal, CloseButton } from "@chakra-ui/react";
import { CiCirclePlus } from "react-icons/ci";
import { useColorModeValue } from "./ui/color-mode.jsx";
import { colors } from "../theme/colors.js";
import HabitsList from "./HabitsList.jsx";

function LogModal() {
  const [isOpen, setIsOpen] = useState(false);

  const bgColor = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const hoverBorderColor = useColorModeValue(colors.border.light, colors.border.dark);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Flex
          p={10}
          borderRadius="md"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          borderWidth={2}
          borderColor="transparent"
          transition="border-color 0.3s ease"
          _hover={{ borderColor: hoverBorderColor }}
        >
          <CiCirclePlus
            style={{
              width: "30%",
              height: "30%",
              color: textColor,
            }}
          />
        </Flex>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg={bgColor}
            borderRadius="xl"
            maxW="500px"
            w="90vw"
            maxH="80vh"
            overflow="hidden"
          >
            <Dialog.Header p={4} borderBottomWidth={1}>
              <Flex justify="space-between" align="center">
                <Dialog.Title color={textColor} fontSize="xl" fontWeight="bold">
                  Log Habits
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>
            <Dialog.Body p={0} overflowY="auto" maxH="60vh">
              <HabitsList />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default LogModal;
