import { useState } from "react";
import { Container, Box, Text, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import HomeCard from "../components/HomeCard.jsx";
import HabitsList from "../components/HabitsList.jsx";
import Chart from "../components/Chart.jsx";
import LogModal from "../components/LogModal.jsx";
import ManageModal from "../components/ManageModal.jsx";

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const textColor = useColorModeValue("#333333ff", "#cececeff");

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
        <HomeCard
          gradientFrom="#007241"
          gradientTo="#A65F00"
          gradientVia="#94002D"
        >
          <Flex flexDir="column" h="100%">
            <Box flex={1} p={4} minH={0}>
              <Chart key={`chart-${refreshKey}`} days={5} />
            </Box>
            <Box flexShrink={0}>
              <HabitsList
                key={`habits-${refreshKey}`}
                onCompletionLogged={handleRefresh}
                limit={3}
                compact
              />
            </Box>
          </Flex>
        </HomeCard>
      </Flex>
      <Flex
        h="30vh"
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={"row"}
      >
        <HomeCard
          gradientFrom="#007241"
          gradientTo="#A65F00"
          gradientVia="#94002D"
        >
          <LogModal onCompletionLogged={handleRefresh} />
        </HomeCard>
        <HomeCard
          gradientFrom="#007241"
          gradientTo="#A65F00"
          gradientVia="#94002D"
        >
          <ManageModal onHabitUpdated={handleRefresh} />
        </HomeCard>
      </Flex>
    </Container>
  );
};

export default Home;
