import { ZodError } from "zod";

/**
 * Format Zod validation errors into a user-friendly message.
 */
const formatZodError = (error) => {
  // Zod v3+ uses 'issues' instead of 'errors'
  const messages = error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return messages.join(", ");
};

/**
 * Global error handling middleware.
 * Catches all errors passed via next(err) and returns consistent JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 internal server error
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";

  // Log error for debugging (with request context)
  console.error(`[${req.method}] ${req.originalUrl} - Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    statusCode,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = formatZodError(err);
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(", ");
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // Don't leak internal error details in production
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "An unexpected error occurred";
  }

  res.status(statusCode).json({ message });
};
