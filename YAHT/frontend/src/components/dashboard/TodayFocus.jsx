import { Box, Flex, Text, Button, VStack, Separator } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { completionsAPI } from "../../services/api";
import { toaster } from "../ui/toaster.jsx";
import { colors } from "../../theme/colors.js";

const TodayFocus = ({ todayFocus, onRefresh }) => {
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const subtextColor = useColorModeValue(colors.textMuted.light, colors.textMuted.dark);
  const riskHighColor = useColorModeValue(colors.error.light, colors.error.dark);
  const riskMedColor = useColorModeValue(colors.warning.light, colors.warning.dark);
  const riskLowColor = useColorModeValue(colors.textMuted.light, colors.textMuted.dark);
  const emptyBg = useColorModeValue(colors.gradient.from + "22", colors.gradient.from + "33");
  const emptyTextColor = useColorModeValue(colors.gradient.from, colors.success.dark);

  const getRiskColor = (score) => {
    if (score >= 3) return riskHighColor;
    if (score >= 2) return riskMedColor;
    return riskLowColor;
  };

  const handleMarkDone = async (habitId) => {
    try {
      await completionsAPI.log(habitId);
      toaster.create({
        title: "Habit completed!",
        type: "success",
        duration: 2000,
      });
      onRefresh();
    } catch (err) {
      toaster.create({
        title: "Error logging completion",
        description: err.message,
        type: "error",
      });
    }
  };

  if (!todayFocus || todayFocus.length === 0) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Today's Focus
        </Text>
        <Flex
          justify="center"
          align="center"
          flex={1}
          bg={emptyBg}
          rounded="md"
        >
          <Text color={emptyTextColor} fontWeight="medium" fontSize="sm">
            All done for today!
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
        Today's Focus
      </Text>
      <VStack align="stretch" gap={0} flex={1} overflowY="auto">
        {todayFocus.map((habit, idx) => (
          <Box key={habit._id}>
            <Flex align="center" gap={2} py={1}>
              {/* Risk indicator bar */}
              <Box
                w="3px"
                h="28px"
                bg={getRiskColor(habit.riskScore)}
                rounded="full"
                flexShrink={0}
              />

              {/* Habit info */}
              <Box flex={1} minW={0}>
                <Text fontWeight="medium" fontSize="sm" color={textColor} isTruncated>
                  {habit.title}
                </Text>
                <Text fontSize="2xs" color={subtextColor}>
                  {habit.reason} · {habit.currentCount}/{habit.target}
                </Text>
              </Box>

              {/* Mark done button */}
              <Button
                size="sm"
                minH="44px"
                variant="outline"
                colorPalette="green"
                onClick={() => handleMarkDone(habit._id)}
                flexShrink={0}
              >
                Done
              </Button>
            </Flex>
            {idx < todayFocus.length - 1 && <Separator />}
          </Box>
        ))}
      </VStack>
    </Flex>
  );
};

export default TodayFocus;
