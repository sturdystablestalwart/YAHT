import { Container, Box, Text, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import { colors } from "../theme/colors.js";
import GradientCard from "../components/GradientCard.jsx";
import HabitsList from "../components/HabitsList.jsx";
import Chart from "../components/Chart.jsx";
import LogModal from "../components/LogModal.jsx";
import ManageModal from "../components/ManageModal.jsx";

const Home = () => {
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);

  return (
    <Container>
      <Text
        fontSize={{
          base: "3xl",
          xl: "4xl",
        }}
        fontWeight="bold"
        color={textColor}
        textAlign="center"
      >
        Home
      </Text>
      <Flex h="50vh">
        <GradientCard
          gradientFrom={colors.gradient.from}
          gradientTo={colors.gradient.to}
          gradientVia={colors.gradient.via}
        >
          <Flex flexDir="column" h="100%">
            <Box flex={1} p={4} minH={0}>
              <Chart days={5} />
            </Box>
            <Box flexShrink={0}>
              <HabitsList limit={3} compact />
            </Box>
          </Flex>
        </GradientCard>
      </Flex>
      <Flex h="30vh" alignItems={"center"} justifyContent={"space-between"} flexDir={"row"}>
        <GradientCard
          gradientFrom={colors.gradient.from}
          gradientTo={colors.gradient.to}
          gradientVia={colors.gradient.via}
        >
          <LogModal />
        </GradientCard>
        <GradientCard
          gradientFrom={colors.gradient.from}
          gradientTo={colors.gradient.to}
          gradientVia={colors.gradient.via}
        >
          <ManageModal />
        </GradientCard>
      </Flex>
    </Container>
  );
};

export default Home;
