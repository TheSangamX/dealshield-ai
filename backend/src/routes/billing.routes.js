import { Router } from 'express';
import { cancel, subscribe } from '../controllers/billing.controller.js';
import { requireAuth } from '../middleware/auth.js';

// The Razorpay webhook is mounted in app.js, before the JSON parser, because it needs the raw body.
const router = Router();

router.post('/subscribe', requireAuth, subscribe);
router.post('/cancel', requireAuth, cancel);

export default router;
