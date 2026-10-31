import { getAccountStatus } from '../services/subscription.service.js';
import { HttpError } from './errorHandler.js';

// Runs after requireAuth. Blocks the request when the monthly plan limit is used up;
// otherwise exposes the account status as req.account.
export async function requireQuota(req, _res, next) {
  const account = await getAccountStatus(req.user.id);
  if (account.remaining === 0) {
    return next(
      new HttpError(
        402,
        `You've used all ${account.limit} free analyses this month. Upgrade to Pro for unlimited analyses.`,
        'QUOTA_EXCEEDED',
      ),
    );
  }
  req.account = account;
  next();
}
