import { useState, useEffect, useRef } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import { completionsAPI } from "../services/api";
import anychart from "anychart";

const Chart = ({ days = 5 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  const bgColor = useColorModeValue("#bbbbbbff", "#222222ff");
  const textColor = useColorModeValue("#333333ff", "#cececeff");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await completionsAPI.getDailyStats(days);
        setData(stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [days]);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Dispose of previous chart if exists
    if (chartRef.current) {
      chartRef.current.dispose();
    }

    // Create chart
    const chart = anychart.column();
    chartRef.current = chart;

    // Configure chart
    chart.background().fill(bgColor);
    chart.title().enabled(false);

    // Format date labels to show only day/month
    const formattedCategories = data.categories.map((dateStr) => {
      const [, month, day] = dateStr.split("-");
      return `${parseInt(month)}/${parseInt(day)}`;
    });

    // Create data set for multi-series
    const dataSet = anychart.data.set(
      formattedCategories.map((cat, idx) => {
        const row = [cat];
        data.series.forEach((s) => {
          row.push(s.data[idx]);
        });
        return row;
      })
    );

    // Color palette for series
    const colors = ["#38a169", "#3182ce", "#d69e2e", "#e53e3e", "#805ad5", "#00b5d8"];

    // Create series for each habit
    data.series.forEach((s, idx) => {
      const mapping = dataSet.mapAs({ x: 0, value: idx + 1 });
      const series = chart.column(mapping);
      series.name(s.name);
      series.fill(colors[idx % colors.length]);
      series.stroke(colors[idx % colors.length]);
    });

    // Configure X axis
    const xAxis = chart.xAxis();
    xAxis.labels().fontColor(textColor);
    xAxis.title().enabled(false);

    // Configure Y axis
    const yAxis = chart.yAxis();
    yAxis.labels().fontColor(textColor);
    yAxis.title().enabled(false);
    yAxis.labels().format("{%value}");

    // Configure legend
    chart.legend().enabled(data.series.length > 0);
    chart.legend().fontColor(textColor);
    chart.legend().position("bottom");
    chart.legend().itemsLayout("horizontal");

    // Configure tooltip
    chart.tooltip().titleFormat("{%x}");
    chart.tooltip().format("{%seriesName}: {%value}");

    // Set container and draw
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
      <Flex justify="center" align="center" h="100%">
        <Spinner size="md" color={textColor} />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Text color="red.500">Error loading chart</Text>
      </Flex>
    );
  }

  if (!data || data.series.length === 0) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Text color={textColor} textAlign="center">
          No habits yet.{"\n"}Create some habits to see stats!
        </Text>
      </Flex>
    );
  }

  return <Box ref={containerRef} w="100%" h="100%" />;
};

export default Chart;
