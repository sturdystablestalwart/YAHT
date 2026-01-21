import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode.jsx";
import { dashboardAPI } from "../../services/api";
import { colors } from "../../theme/colors.js";
import anychart from "anychart";

const TrendChart = ({ range, habitId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const bgColor = useColorModeValue(colors.cardBg.light, colors.cardBg.dark);
  const gridColor = useColorModeValue(colors.grid.light, colors.grid.dark);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dashboardAPI.getTrends(range, habitId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, habitId]);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.dispose();
    }

    const chart = anychart.line();
    chartRef.current = chart;

    chart.background().fill(bgColor);
    chart.title().enabled(false);

    // Format data for chart
    const mainData = data.data.map((d) => {
      const date = new Date(d.date);
      return [date.getTime(), d.rate];
    });

    const rollingData = data.rollingAverage.map((d) => {
      const date = new Date(d.date);
      return [date.getTime(), d.rate];
    });

    // Main completion rate line
    const mainSeries = chart.line(mainData);
    mainSeries.name("Completion Rate");
    mainSeries.stroke({ color: colors.gradient.from, thickness: 2 });
    mainSeries.markers().enabled(false);

    // Rolling average line (lighter)
    const rollingSeries = chart.line(rollingData);
    rollingSeries.name("7-Day Average");
    rollingSeries.stroke({ color: colors.gradient.from, thickness: 2, opacity: 0.3 });
    rollingSeries.markers().enabled(false);

    // Configure X axis (datetime)
    const xAxis = chart.xAxis();
    xAxis.labels().fontColor(textColor);
    xAxis.labels().fontSize(10);
    xAxis.labels().format(function () {
      const date = new Date(this.value);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
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
    chart.yGrid().enabled(true);
    chart.yGrid().stroke({ color: gridColor, thickness: 1, opacity: 0.5 });
    chart.xGrid().enabled(false);

    // Configure legend
    chart.legend().enabled(true);
    chart.legend().fontColor(textColor);
    chart.legend().fontSize(10);
    chart.legend().position("bottom");

    // Configure tooltip
    chart.tooltip().format(function () {
      const date = new Date(this.x);
      const dateStr = date.toLocaleDateString();
      return `${dateStr}: ${this.value}%`;
    });

    chart.container(containerRef.current);
    chart.draw();

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [data, bgColor, textColor, gridColor]);

  if (loading) {
    return (
      <Flex direction="column" h="100%">
        <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
          Trends
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
          Trends
        </Text>
        <Flex justify="center" align="center" flex={1}>
          <Text color="red.500" fontSize="sm">Error loading trends</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      <Text fontWeight="semibold" mb={1} fontSize="sm" color={textColor}>
        Trends
      </Text>
      <Box ref={containerRef} w="100%" flex={1} minH={0} />
    </Flex>
  );
};

export default TrendChart;
