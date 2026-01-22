import { useEffect, useRef } from "react";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { useTimeHeatmap } from "../../hooks/queries/useDashboard";
import { colors } from "../../theme/colors.js";
import anychart from "anychart";

const TimeHeatmap = ({ range, habitId }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const bgColor = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);

  const { data, isLoading: loading, error } = useTimeHeatmap(range, habitId);

  useEffect(() => {
    if (!data || !containerRef.current || data.habits.length === 0) return;

    if (chartRef.current) {
      chartRef.current.dispose();
    }

    // Transform matrix data for heatmap
    const heatmapData = [];
    data.habits.forEach((habit, habitIdx) => {
      data.hours.forEach((hour, hourIdx) => {
        const count = data.matrix[habitIdx]?.[hourIdx] || 0;
        heatmapData.push({
          x: `${hour}:00`,
          y: habit,
          heat: count,
        });
      });
    });

    const chart = anychart.heatMap(heatmapData);
    chartRef.current = chart;

    chart.background().fill(bgColor);
    chart.title().enabled(false);

    // Color scale - GitHub-style green gradient
    const colorScale = anychart.scales.linearColor();
    colorScale.colors(colors.heatmap);
    chart.colorScale(colorScale);

    // Configure axes
    chart.xAxis().labels().fontColor(textColor);
    chart.xAxis().labels().fontSize(9);
    chart.xAxis().labels().rotation(-45);
    chart.xAxis().stroke("none");

    chart.yAxis().labels().fontColor(textColor);
    chart.yAxis().labels().fontSize(10);
    chart.yAxis().stroke("none");

    // Configure cells
    chart.stroke(bgColor);
    chart.labels().enabled(false);

    // Configure tooltip
    chart
      .tooltip()
      .useHtml(true)
      .format(function () {
        const habit = this.getData("y");
        const hour = this.getData("x");
        const count = this.getData("heat");
        return `<span style="font-size:12px"><b>${habit}</b><br/>${hour}: ${count} completions</span>`;
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
          Time of Day
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
          Time of Day
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Text color="red.500" fontSize="sm">
            Error loading time heatmap
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (!data || data.habits.length === 0) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Time of Day
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Text color="gray.500" fontSize="sm">
            No completion data available
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
        Time of Day
      </Text>
      <Box ref={containerRef} w="100%" flex={1} minH={0} />
    </Flex>
  );
};

export default TimeHeatmap;
