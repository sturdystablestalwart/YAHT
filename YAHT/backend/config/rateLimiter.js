import rateLimit from "express-rate-limit";

/**
 * Rate limiter for auth routes (10 requests per 15 minutes)
 * Prevents brute-force attacks on login and registration
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
