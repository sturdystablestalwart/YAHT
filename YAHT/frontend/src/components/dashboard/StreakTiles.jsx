import { Box, Flex, Text, Badge, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { colors } from "../../theme/colors.js";

const StreakTiles = ({ habits, selectedHabitId, onSelectHabit }) => {
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const subtextColor = useColorModeValue(colors.textMuted.light, colors.textMuted.dark);
  const tileBg = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);
  const selectedBg = useColorModeValue(colors.gradient.from + "22", colors.gradient.from + "44");

  const getStatusBadge = (status) => {
    switch (status) {
      case "done":
        return { color: "green", label: "Done" };
      case "at-risk":
        return { color: "orange", label: "At Risk" };
      case "due":
      default:
        return { color: "gray", label: "Due" };
    }
  };

  if (!habits || habits.length === 0) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Streaks
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Text color={subtextColor} fontSize="sm">
            No habits to display
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
        Streaks
      </Text>
      <Flex
        overflowX="auto"
        gap={2}
        flex={1}
        alignItems="flex-start"
        css={{
          "&::-webkit-scrollbar": {
            height: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "gray.300",
            borderRadius: "2px",
          },
        }}
      >
        {habits.map((habit) => {
          const badge = getStatusBadge(habit.status);
          const isSelected = selectedHabitId === habit._id;

          return (
            <Box
              key={habit._id}
              minW="110px"
              maxW="110px"
              p={2}
              bg={isSelected ? selectedBg : tileBg}
              rounded="md"
              cursor="pointer"
              onClick={() => onSelectHabit(habit._id)}
              borderWidth={isSelected ? "2px" : "1px"}
              borderColor={isSelected ? colors.gradient.from : "transparent"}
              transition="all 0.2s"
              _hover={{
                shadow: "sm",
              }}
            >
              <Text fontSize="xs" fontWeight="medium" color={textColor} isTruncated>
                {habit.title}
              </Text>
              <HStack justify="space-between" align="baseline" mt={1}>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {habit.currentStreak}
                  </Text>
                  <Text fontSize="2xs" color={subtextColor}>
                    current
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="xs" color={subtextColor}>
                    {habit.longestStreak}
                  </Text>
                  <Text fontSize="2xs" color={subtextColor}>
                    best
                  </Text>
                </Box>
              </HStack>
              <Badge
                mt={1}
                colorPalette={badge.color}
                variant="subtle"
                size="xs"
              >
                {badge.label}
              </Badge>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default StreakTiles;
