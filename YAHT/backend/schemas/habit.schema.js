import { z } from "zod";

// HH:mm time format regex (00:00 to 23:59)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

// MongoDB ObjectId regex
const objectIdRegex = /^[a-f\d]{24}$/i;

// Frequency can be object { target, period } or string "3 per day"
const frequencySchema = z.union([
  z.object({
    target: z.number().int().min(1, "Target must be at least 1"),
    period: z.enum(["day", "week", "month"]),
  }),
  z.string().regex(/^\d+\s+per\s+(day|week|month)$/i, 'Use format "X per day/week/month"'),
]);

// Reminder settings schema
const reminderSettingsSchema = z
  .object({
    enabled: z.boolean().optional(),
    time: z.string().regex(timeRegex, "Invalid time format. Use HH:mm").optional(),
    days: z
      .array(z.number().int().min(0).max(6))
      .optional()
      .refine(
        (days) => !days || days.every((d) => d >= 0 && d <= 6),
        "Days must be between 0 (Sunday) and 6 (Saturday)"
      ),
  })
  .optional();

/**
 * Schema for POST /api/habits
 */
export const createHabitSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }).min(1, "Title is required"),
    frequency: frequencySchema,
    active: z.boolean({ required_error: "Active status is required" }),
    description: z.string().optional(),
    dateStarted: z.string().datetime().or(z.date()).optional(),
    reminderSettings: reminderSettingsSchema,
  }),
});

/**
 * Schema for PUT /api/habits/:id
 */
export const updateHabitSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid habit ID format"),
  }),
  body: z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    frequency: frequencySchema.optional(),
    active: z.boolean().optional(),
    description: z.string().optional(),
    dateStarted: z.string().datetime().or(z.date()).optional(),
    dateAbandoned: z.string().datetime().or(z.date()).nullable().optional(),
    reminderSettings: reminderSettingsSchema,
  }),
});

/**
 * Schema for GET/DELETE /api/habits/:id
 */
export const habitIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid habit ID format"),
  }),
});
