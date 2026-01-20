import { Container, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import NotificationSettings from "../components/notifications/NotificationSettings.jsx";

const Settings = () => {
  const textColor = useColorModeValue("#333333ff", "#cececeff");

  return (
    <Container maxW="container.md" py={8}>
      <Text
        fontSize={{
          base: "3xl",
          xl: "4xl",
        }}
        fontWeight="bold"
        color={textColor}
        textAlign="center"
        mb={8}
      >
        Settings
      </Text>
      <VStack align="stretch" gap={6}>
        <NotificationSettings />
      </VStack>
    </Container>
  );
};

export default Settings;
