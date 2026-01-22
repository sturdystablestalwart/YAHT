import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "../../services/api";

export const dashboardKeys = {
  all: ["dashboard"],
  summary: (range) => [...dashboardKeys.all, "summary", range],
  calendar: (weeks, habitId) => [...dashboardKeys.all, "calendar", weeks, habitId],
  trends: (range, habitId) => [...dashboardKeys.all, "trends", range, habitId],
  timeHeatmap: (range, habitId) => [...dashboardKeys.all, "timeHeatmap", range, habitId],
};

export function useDashboardSummary(range = "30d") {
  return useQuery({
    queryKey: dashboardKeys.summary(range),
    queryFn: () => dashboardAPI.getSummary(range),
  });
}

export function useCalendarHeatmap(weeks, habitId = null) {
  return useQuery({
    queryKey: dashboardKeys.calendar(weeks, habitId),
    queryFn: () => dashboardAPI.getCalendar(weeks, habitId),
  });
}

export function useTrends(range, habitId = null) {
  return useQuery({
    queryKey: dashboardKeys.trends(range, habitId),
    queryFn: () => dashboardAPI.getTrends(range, habitId),
  });
}

export function useTimeHeatmap(range, habitId = null) {
  return useQuery({
    queryKey: dashboardKeys.timeHeatmap(range, habitId),
    queryFn: () => dashboardAPI.getTimeHeatmap(range, habitId),
  });
}
