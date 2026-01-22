import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { habitsAPI, completionsAPI } from "../../services/api";

// Query Keys
export const habitKeys = {
  all: ["habits"],
  lists: () => [...habitKeys.all, "list"],
  detail: (id) => [...habitKeys.all, "detail", id],
};

export const streakKeys = {
  all: ["streaks"],
};

// Queries
export function useHabits() {
  return useQuery({
    queryKey: habitKeys.lists(),
    queryFn: habitsAPI.getAll,
  });
}

export function useHabit(id) {
  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: () => habitsAPI.getOne(id),
    enabled: !!id,
  });
}

export function useStreaks() {
  return useQuery({
    queryKey: streakKeys.all,
    queryFn: completionsAPI.getStreaks,
  });
}

// Mutations with Optimistic Updates
export function useLogCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completionsAPI.log,
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: streakKeys.all });
      const previousStreaks = queryClient.getQueryData(streakKeys.all);

      // Optimistically mark as complete
      queryClient.setQueryData(streakKeys.all, (old) => {
        if (!old) return old;
        return {
          ...old,
          [habitId]: {
            ...old[habitId],
            periodComplete: true,
            currentStreak: (old[habitId]?.currentStreak || 0) + 1,
          },
        };
      });

      return { previousStreaks };
    },
    onError: (err, habitId, context) => {
      queryClient.setQueryData(streakKeys.all, context.previousStreaks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: streakKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["completions"] });
    },
  });
}

export function useDeleteTodayCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completionsAPI.deleteToday,
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: streakKeys.all });
      const previousStreaks = queryClient.getQueryData(streakKeys.all);

      // Optimistically mark as incomplete
      queryClient.setQueryData(streakKeys.all, (old) => {
        if (!old) return old;
        return {
          ...old,
          [habitId]: {
            ...old[habitId],
            periodComplete: false,
            currentStreak: Math.max(0, (old[habitId]?.currentStreak || 1) - 1),
          },
        };
      });

      return { previousStreaks };
    },
    onError: (err, habitId, context) => {
      queryClient.setQueryData(streakKeys.all, context.previousStreaks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: streakKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["completions"] });
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => habitsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
    },
  });
}
