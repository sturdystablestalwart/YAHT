import { useState, useEffect } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { FaRegCircle, FaCheckCircle } from "react-icons/fa";
import { useColorModeValue } from "./ui/color-mode.jsx";
import { habitsAPI, completionsAPI } from "../services/api";

function HabitsList({ onCompletionLogged, limit, compact = false }) {
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const textColor = useColorModeValue("#333333ff", "#cececeff");
  const successColor = useColorModeValue("#38a169", "#68d391");
  const hoverBorderColor = useColorModeValue("#666666", "#888888");

  const fetchData = async () => {
    try {
      const [habitsData, streaksData] = await Promise.all([
        habitsAPI.getAll(),
        completionsAPI.getStreaks(),
      ]);
      console.log("Habits data:", habitsData);
      console.log("Streaks data:", streaksData);
      setHabits(habitsData);
      setStreaks(streaksData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (habitId) => {
    console.log("handleToggle called for habit:", habitId);
    if (processingId) {
      console.log("Already processing, returning");
      return;
    }

    const habitStreak = streaks[habitId];
    const isComplete = habitStreak?.periodComplete;
    console.log("Current streak data:", habitStreak, "isComplete:", isComplete);

    setProcessingId(habitId);
    try {
      if (isComplete) {
        console.log("Deleting completion...");
        await completionsAPI.deleteToday(habitId);
      } else {
        console.log("Logging completion...");
        await completionsAPI.log(habitId);
      }

      console.log("Fetching new streaks...");
      const newStreaks = await completionsAPI.getStreaks();
      console.log("New streaks:", newStreaks);
      setStreaks(newStreaks);

      if (onCompletionLogged) {
        onCompletionLogged();
      }
    } catch (err) {
      console.error("Error toggling completion:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getProgressText = (habitId) => {
    const habitStreak = streaks[habitId];
    if (!habitStreak) return "0/1";

    const currentCount = habitStreak.currentCount ?? 0;
    const target = habitStreak.target ?? 1;
    const periodComplete = habitStreak.periodComplete ?? false;

    if (currentCount > target) {
      return `${currentCount}/${target} ✓`;
    }
    if (periodComplete) {
      return `${currentCount}/${target} ✓`;
    }
    return `${currentCount}/${target}`;
  };

  const getStreakText = (habitId) => {
    const habitStreak = streaks[habitId];
    if (!habitStreak) return "0 days";

    const streak = habitStreak.streak ?? 0;
    const period = habitStreak.period ?? "day";
    const periodLabel = period === "week" ? "week" : period === "month" ? "month" : "day";
    const pluralLabel = streak === 1 ? periodLabel : `${periodLabel}s`;

    if (streak === 0) return `0 ${pluralLabel}`;
    return `${streak} ${pluralLabel} 🔥`;
  };

  const isHabitComplete = (habitId) => {
    return streaks[habitId]?.periodComplete || false;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" p={4} h={compact ? "auto" : undefined}>
        <Spinner size="md" color={textColor} />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  if (habits.length === 0) {
    return (
      <Box p={4}>
        <Text color={textColor} textAlign="center">
          No habits yet. Create one to get started!
        </Text>
      </Box>
    );
  }

  const displayedHabits = limit ? habits.slice(0, limit) : habits;
  const remainingCount = limit ? Math.max(0, habits.length - limit) : 0;

  // Compact horizontal layout
  if (compact) {
    return (
      <Box p={2} w="100%">
        <Flex gap={2} w="100%">
          {displayedHabits.map((habit) => {
            const isComplete = isHabitComplete(habit._id);
            const isProcessing = processingId === habit._id;

            return (
              <Box
                key={habit._id}
                flex={1}
                p={3}
                borderWidth={1}
                borderColor={isComplete ? successColor : "transparent"}
                borderRadius="md"
                textAlign="center"
                opacity={isComplete ? 0.8 : 1}
                transition="border-color 0.3s ease"
                cursor={isProcessing ? "wait" : "pointer"}
                onClick={() => handleToggle(habit._id)}
                _hover={{
                  borderColor: isComplete ? successColor : hoverBorderColor,
                }}
                minW={0}
              >
                {isProcessing ? (
                  <Spinner size="sm" color={textColor} />
                ) : (
                  <>
                    <Text
                      fontWeight="bold"
                      color={textColor}
                      fontSize="sm"
                      noOfLines={1}
                    >
                      {habit.title}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={isComplete ? successColor : textColor}
                      opacity={0.8}
                    >
                      {getProgressText(habit._id)} · {getStreakText(habit._id)}
                    </Text>
                  </>
                )}
              </Box>
            );
          })}
        </Flex>
        {remainingCount > 0 && (
          <Text fontSize="xs" color={textColor} opacity={0.6} textAlign="center" pt={2}>
            +{remainingCount} more
          </Text>
        )}
      </Box>
    );
  }

  // Full list layout (for modals)
  return (
    <Box p={4}>
      <VStack align="stretch" gap={2}>
        {displayedHabits.map((habit) => {
          const isComplete = isHabitComplete(habit._id);
          const isProcessing = processingId === habit._id;

          return (
            <HStack
              key={habit._id}
              p={3}
              borderWidth={1}
              borderColor={isComplete ? successColor : "transparent"}
              borderRadius="md"
              justify="space-between"
              opacity={isComplete ? 0.8 : 1}
              transition="border-color 0.3s ease"
              cursor={isProcessing ? "wait" : "pointer"}
              onClick={() => handleToggle(habit._id)}
              _hover={{
                borderColor: isComplete ? successColor : hoverBorderColor,
              }}
            >
              <Box>
                <Text fontWeight="bold" color={textColor}>
                  {habit.title}
                </Text>
                <HStack gap={2} fontSize="sm" opacity={0.8}>
                  <Text color={isComplete ? successColor : textColor}>
                    {getProgressText(habit._id)}
                  </Text>
                  <Text color={textColor}>·</Text>
                  <Text color={isComplete ? successColor : textColor}>
                    {getStreakText(habit._id)}
                  </Text>
                </HStack>
              </Box>
              <Box color={isComplete ? successColor : textColor} p={1}>
                {isProcessing ? (
                  <Spinner size="sm" />
                ) : isComplete ? (
                  <FaCheckCircle size={22} />
                ) : (
                  <FaRegCircle size={22} />
                )}
              </Box>
            </HStack>
          );
        })}
        {remainingCount > 0 && (
          <Text fontSize="sm" color={textColor} opacity={0.6} textAlign="center" pt={1}>
            and {remainingCount} more...
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default HabitsList;
