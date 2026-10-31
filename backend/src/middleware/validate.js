import { HttpError } from './errorHandler.js';

// Replaces req.body with the parsed (trimmed, stripped) value, or responds 400.
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue.path.length ? `${issue.path.join('.')}: ` : '';
    return next(new HttpError(400, `${where}${issue.message}`, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  next();
};
