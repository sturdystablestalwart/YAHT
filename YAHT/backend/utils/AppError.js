/**
 * Custom error class for operational errors (expected errors we can handle).
 * These are errors we anticipate: validation failures, not found, unauthorized, etc.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
