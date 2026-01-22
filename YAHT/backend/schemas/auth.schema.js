import { z } from "zod";

// HH:mm time format regex (00:00 to 23:59)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Schema for POST /api/auth/register
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Please provide a valid email"),
    username: z
      .string({ required_error: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

/**
 * Schema for POST /api/auth/login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Please provide a valid email"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

/**
 * Schema for PATCH /api/auth/notification-settings
 */
export const updateNotificationSettingsSchema = z.object({
  body: z.object({
    enabled: z.boolean().optional(),
    permission: z.enum(["default", "granted", "denied"]).optional(),
    quietHoursStart: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .nullable()
      .optional(),
    quietHoursEnd: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .nullable()
      .optional(),
  }),
});
