import { useEffect, useRef } from "react";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { useCalendarHeatmap } from "../../hooks/queries/useDashboard";
import { colors } from "../../theme/colors.js";
import anychart from "anychart";

const CalendarHeatmap = ({ range, habitId }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const bgColor = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);

  // Calculate weeks from range
  const weeks = range === "7d" ? 2 : range === "30d" ? 5 : 13;

  const { data: result, isLoading: loading, error } = useCalendarHeatmap(weeks, habitId);
  const data = result?.data;

  useEffect(() => {
    if (!data || !containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.dispose();
    }

    // Process data for calendar chart format: [date, value, completed, total]
    const calendarData = data.map((d) => ({
      x: d.date,
      value: d.intensity,
      completed: d.completed,
      total: d.total,
    }));

    // Create calendar chart
    const chart = anychart.calendar(calendarData);
    chartRef.current = chart;

    chart.background().fill(bgColor);
    chart.title().enabled(false);

    // Color scale - GitHub-style green gradient
    const colorScale = anychart.scales.linearColor();
    colorScale.colors(colors.heatmap);
    chart.colorScale(colorScale);

    // Configure days
    chart.days().spacing(3);
    chart.days().stroke(bgColor);

    // Configure weeks
    chart.weeks().showWeekends(true);
    chart.weeks().labels().fontColor(textColor);
    chart.weeks().labels().fontSize(10);

    // Configure months
    chart.months().stroke({ color: textColor, thickness: 0.5, opacity: 0.3 });
    chart.months().labels().fontColor(textColor);
    chart.months().labels().fontSize(11);

    // Configure tooltip
    chart
      .tooltip()
      .useHtml(true)
      .format(function () {
        const date = this.getData("x");
        const completed = this.getData("completed");
        const total = this.getData("total");
        return `<span style="font-size:12px"><b>${date}</b><br/>${completed}/${total} habits completed</span>`;
      });

    chart.container(containerRef.current);
    chart.draw();

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [data, bgColor, textColor]);

  if (loading) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Activity
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Spinner size="sm" color={textColor} />
        </Flex>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Activity
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Text color="red.500" fontSize="sm">
            Error loading calendar
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
        Activity
      </Text>
      <Box ref={containerRef} w="100%" flex={1} minH={0} />
    </Flex>
  );
};

export default CalendarHeatmap;
