import { z } from "zod";

// MongoDB ObjectId regex
const objectIdRegex = /^[a-f\d]{24}$/i;

/**
 * Schema for POST /api/completions
 */
export const logCompletionSchema = z.object({
  body: z.object({
    habitId: z
      .string({ required_error: "habitId is required" })
      .regex(objectIdRegex, "Invalid habitId format"),
  }),
});

/**
 * Schema for DELETE /api/completions/:habitId
 */
export const deleteCompletionSchema = z.object({
  params: z.object({
    habitId: z.string().regex(objectIdRegex, "Invalid habitId format"),
  }),
});

/**
 * Schema for GET /api/completions/:habitId
 */
export const getCompletionsSchema = z.object({
  params: z.object({
    habitId: z.string().regex(objectIdRegex, "Invalid habitId format"),
  }),
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

/**
 * Schema for GET /api/completions/stats
 */
export const statsQuerySchema = z.object({
  query: z.object({
    days: z.coerce
      .number()
      .int()
      .min(1, "Days must be at least 1")
      .max(365, "Days cannot exceed 365")
      .default(7),
  }),
});

/**
 * Schema for GET /api/completions/daily-stats
 */
export const dailyStatsQuerySchema = z.object({
  query: z.object({
    days: z.coerce
      .number()
      .int()
      .min(1, "Days must be at least 1")
      .max(365, "Days cannot exceed 365")
      .default(5),
  }),
});
