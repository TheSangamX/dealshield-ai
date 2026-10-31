import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from './errorHandler.js';

// Verifies the Supabase access token from "Authorization: Bearer <jwt>" and sets req.user.
export async function requireAuth(req, _res, next) {
  if (!supabaseAdmin) {
    return next(new HttpError(500, 'Authentication is not configured on the server.', 'AUTH_NOT_CONFIGURED'));
  }

  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Please sign in to continue.', 'UNAUTHENTICATED'));
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return next(new HttpError(401, 'Your session has expired. Please sign in again.', 'UNAUTHENTICATED'));
  }

  req.user = { id: data.user.id, email: data.user.email };
  next();
}
