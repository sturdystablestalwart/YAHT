import { useQuery } from "@tanstack/react-query";
import { completionsAPI } from "../../services/api";

export const completionKeys = {
  all: ["completions"],
  dailyStats: (days) => [...completionKeys.all, "dailyStats", days],
  stats: (days) => [...completionKeys.all, "stats", days],
};

export function useDailyStats(days = 5) {
  return useQuery({
    queryKey: completionKeys.dailyStats(days),
    queryFn: () => completionsAPI.getDailyStats(days),
  });
}

export function useStats(days = 7) {
  return useQuery({
    queryKey: completionKeys.stats(days),
    queryFn: () => completionsAPI.getStats(days),
  });
}
