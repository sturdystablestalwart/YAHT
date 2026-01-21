import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Heading,
  Button,
  Spinner,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Container,
  VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { LuChevronDown } from "react-icons/lu";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import { dashboardAPI } from "../services/api";
import { colors } from "../theme/colors.js";
import HomeCard from "../components/HomeCard.jsx";
import StreakTiles from "../components/dashboard/StreakTiles.jsx";
import TodayFocus from "../components/dashboard/TodayFocus.jsx";
import CalendarHeatmap from "../components/dashboard/CalendarHeatmap.jsx";
import TrendChart from "../components/dashboard/TrendChart.jsx";
import CompletionBars from "../components/dashboard/CompletionBars.jsx";
import TimeHeatmap from "../components/dashboard/TimeHeatmap.jsx";

const gradientAnimation = keyframes`
  0% { background-position: 0% 100%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 0%; }
`;

const Dashboard = () => {
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [range, setRange] = useState("30d");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const textMuted = useColorModeValue(colors.textMuted.light, colors.textMuted.dark);

  // Shared gradient props for HomeCard
  const gradientProps = {
    gradientFrom: colors.gradient.from,
    gradientTo: colors.gradient.to,
    gradientVia: colors.gradient.via,
  };

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getSummary(range);
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSelectHabit = (habitId) => {
    setSelectedHabitId(habitId === selectedHabitId ? null : habitId);
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const selectedHabitName = selectedHabitId
    ? summary?.habits?.find((h) => h._id === selectedHabitId)?.title
    : "All Habits";

  if (loading && !summary) {
    return (
      <Container maxW="container.xl" py={4}>
        <Flex justify="center" align="center" h="50vh">
          <Spinner size="lg" color={textColor} />
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={4}>
        <Flex justify="center" align="center" h="50vh" direction="column" gap={4}>
          <Text color="red.500">Error loading dashboard</Text>
          <Button onClick={fetchSummary} size="sm" minH="44px">
            Retry
          </Button>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={2} px={{ base: 2, md: 4 }}>
      {/* Header Row */}
      <Flex align="center" justify="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Heading
            size={{ base: "md", md: "lg" }}
            bgGradient="to-r"
            gradientFrom={colors.gradient.from}
            gradientVia={colors.gradient.via}
            gradientTo={colors.gradient.to}
            bgClip="text"
            css={{
              backgroundSize: "200% 200%",
              animation: `${gradientAnimation} 10s ease infinite`,
            }}
          >
            Dashboard
          </Heading>
          <Text fontSize="xs" color={textMuted}>
            {formattedDate}
          </Text>
        </Box>
        <HStack gap={1} flexWrap="wrap">
          {/* Habit filter menu */}
          <MenuRoot>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm" minH="44px">
                {selectedHabitName} <LuChevronDown style={{ marginLeft: "4px" }} />
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="all" onClick={() => setSelectedHabitId(null)}>
                All Habits
              </MenuItem>
              {summary?.habits?.map((habit) => (
                <MenuItem
                  key={habit._id}
                  value={habit._id}
                  onClick={() => handleSelectHabit(habit._id)}
                >
                  {habit.title}
                </MenuItem>
              ))}
            </MenuContent>
          </MenuRoot>

          {/* Range selector */}
          <HStack gap={0}>
            {["7d", "30d", "90d"].map((r) => (
              <Button
                key={r}
                size="sm"
                minH="44px"
                minW="44px"
                variant={range === r ? "solid" : "ghost"}
                onClick={() => handleRangeChange(r)}
              >
                {r.toUpperCase()}
              </Button>
            ))}
          </HStack>
        </HStack>
      </Flex>

      {/* Mobile Layout: Scrollable stack */}
      <VStack
        display={{ base: "flex", lg: "none" }}
        align="stretch"
        gap={3}
        pb={4}
      >
        {/* Streaks */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="140px">
            <StreakTiles
              habits={summary?.habits || []}
              selectedHabitId={selectedHabitId}
              onSelectHabit={handleSelectHabit}
            />
          </Box>
        </HomeCard>

        {/* Today's Focus */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="160px" maxH="300px" overflow="auto">
            <TodayFocus
              todayFocus={summary?.todayFocus || []}
              onRefresh={fetchSummary}
            />
          </Box>
        </HomeCard>

        {/* Calendar Heatmap */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="200px">
            <CalendarHeatmap range={range} habitId={selectedHabitId} />
          </Box>
        </HomeCard>

        {/* Time Heatmap */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="180px">
            <TimeHeatmap range={range} habitId={selectedHabitId} />
          </Box>
        </HomeCard>

        {/* Trend Chart */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="200px">
            <TrendChart range={range} habitId={selectedHabitId} />
          </Box>
        </HomeCard>

        {/* Completion Bars */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="160px">
            <CompletionBars
              habits={summary?.habits || []}
              selectedHabitId={selectedHabitId}
              onSelectHabit={handleSelectHabit}
            />
          </Box>
        </HomeCard>
      </VStack>

      {/* Desktop Layout: 2-column grid */}
      <Box
        display={{ base: "none", lg: "grid" }}
        gridTemplateColumns="1fr 1fr"
        gridTemplateRows="auto auto auto"
        gap={3}
        pb={4}
      >
        {/* Row 1: Streaks + Today's Focus */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="160px">
            <StreakTiles
              habits={summary?.habits || []}
              selectedHabitId={selectedHabitId}
              onSelectHabit={handleSelectHabit}
            />
          </Box>
        </HomeCard>
        <HomeCard {...gradientProps}>
          <Box p={3} minH="160px" maxH="250px" overflow="auto">
            <TodayFocus
              todayFocus={summary?.todayFocus || []}
              onRefresh={fetchSummary}
            />
          </Box>
        </HomeCard>

        {/* Row 2: Calendar + Time Heatmap */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="220px">
            <CalendarHeatmap range={range} habitId={selectedHabitId} />
          </Box>
        </HomeCard>
        <HomeCard {...gradientProps}>
          <Box p={3} minH="220px">
            <TimeHeatmap range={range} habitId={selectedHabitId} />
          </Box>
        </HomeCard>

        {/* Row 3: Trends + Completion Bars */}
        <HomeCard {...gradientProps}>
          <Box p={3} minH="200px">
            <TrendChart range={range} habitId={selectedHabitId} />
          </Box>
        </HomeCard>
        <HomeCard {...gradientProps}>
          <Box p={3} minH="200px">
            <CompletionBars
              habits={summary?.habits || []}
              selectedHabitId={selectedHabitId}
              onSelectHabit={handleSelectHabit}
            />
          </Box>
        </HomeCard>
      </Box>
    </Container>
  );
};

export default Dashboard;
