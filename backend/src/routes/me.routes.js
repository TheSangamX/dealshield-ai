import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAccountStatus } from '../services/subscription.service.js';

const router = Router();

// GET /api/me → { data: { user, account: { plan, status, limit, used, remaining } } }
router.get('/', requireAuth, async (req, res) => {
  const account = await getAccountStatus(req.user.id);
  res.json({ data: { user: req.user, account } });
});

export default router;
