import { logger } from '../utils/logger.js';

export class HttpError extends Error {
  constructor(status, message, code = 'ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}

// Maps errors to { error: { message, code } }. Provider details are logged, not sent to the client.
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let message = 'Something went wrong.';
  let code = 'INTERNAL_ERROR';

  if (err instanceof HttpError) {
    ({ status, message, code } = err);
  } else if (err?.type === 'entity.parse.failed') {
    [status, message, code] = [400, 'Request body must be valid JSON.', 'INVALID_JSON'];
  } else if (err?.type === 'entity.too.large') {
    [status, message, code] = [413, 'Request body is too large.', 'PAYLOAD_TOO_LARGE'];
  }

  if (status >= 500) {
    const detail = err.cause ? `${err.message} (cause: ${err.cause.message})` : err.message;
    logger.error(detail);
  }

  res.status(status).json({ error: { message, code } });
}
