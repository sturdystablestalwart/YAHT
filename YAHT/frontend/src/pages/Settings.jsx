import { Container, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import { colors } from "../theme/colors.js";
import HomeCard from "../components/HomeCard.jsx";
import NotificationSettings from "../components/notifications/NotificationSettings.jsx";

const Settings = () => {
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);

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
        mb={6}
      >
        Settings
      </Text>
      <HomeCard
        gradientFrom={colors.gradient.from}
        gradientTo={colors.gradient.to}
        gradientVia={colors.gradient.via}
      >
        <VStack align="stretch" gap={6} p={6}>
          <NotificationSettings />
        </VStack>
      </HomeCard>
    </Container>
  );
};

export default Settings;
