/**
 * Validation middleware factory.
 * Takes a Zod schema and returns middleware that validates the request.
 *
 * Usage:
 *   router.post('/route', validate(mySchema), controller);
 *
 * The schema should define body, query, and/or params as needed.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    // Pass the ZodError to the global error handler
    return next(result.error);
  }

  // Only replace body (query and params are read-only in Express 5)
  // The validated data is still available in result.data if needed
  if (result.data.body) {
    req.body = result.data.body;
  }

  next();
};
