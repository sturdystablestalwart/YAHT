import { useEffect, useRef } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { colors } from "../../theme/colors.js";
import anychart from "anychart";

const CompletionBars = ({ habits, selectedHabitId, onSelectHabit }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const bgColor = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);
  const gridColor = useColorModeValue(colors.grid.light, colors.grid.dark);

  useEffect(() => {
    if (!habits || habits.length === 0 || !containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.dispose();
    }

    // Sort habits by completion rate descending
    const sortedHabits = [...habits].sort((a, b) => b.completionRate - a.completionRate);

    const chart = anychart.bar();
    chartRef.current = chart;

    chart.background().fill(bgColor);
    chart.title().enabled(false);

    // Prepare data
    const chartData = sortedHabits.map((h) => ({
      x: h.title,
      value: h.completionRate,
      id: h._id,
      fill: h._id === selectedHabitId ? colors.gradient.via : colors.gradient.from,
    }));

    const series = chart.bar(chartData);
    series.name("Completion Rate");

    // Custom fill for selected habit
    series.fill(function () {
      return this.getData("fill");
    });
    series.stroke("none");

    // Configure X axis (categories)
    const xAxis = chart.xAxis();
    xAxis.labels().fontColor(textColor);
    xAxis.labels().fontSize(10);
    xAxis.stroke(gridColor);

    // Configure Y axis (percentage)
    const yAxis = chart.yAxis();
    yAxis.labels().fontColor(textColor);
    yAxis.labels().fontSize(10);
    yAxis.labels().format("{%value}%");
    yAxis.stroke(gridColor);

    // Set scale bounds on the chart's yScale
    const yScale = chart.yScale();
    yScale.minimum(0);
    yScale.maximum(100);

    // Light gridlines
    chart.xGrid().enabled(true);
    chart.xGrid().stroke({ color: gridColor, thickness: 1, opacity: 0.5 });
    chart.yGrid().enabled(false);

    // Configure legend
    chart.legend().enabled(false);

    // Configure tooltip
    chart.tooltip().format("{%x}: {%value}%");

    // Click handler
    chart.listen("pointClick", function (e) {
      const habitId = e.point.get("id");
      if (habitId && onSelectHabit) {
        onSelectHabit(habitId);
      }
    });

    chart.container(containerRef.current);
    chart.draw();

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [habits, selectedHabitId, bgColor, textColor, gridColor, onSelectHabit]);

  if (!habits || habits.length === 0) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Completion Rates
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Text color="gray.500" fontSize="sm">
            No habits to display
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
        Completion Rates
      </Text>
      <Box ref={containerRef} w="100%" flex={1} minH={0} />
    </Flex>
  );
};

export default CompletionBars;
