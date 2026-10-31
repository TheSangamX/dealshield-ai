import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

// AI calls cost money; cap each signed-in user (or IP, before auth) at 20 per minute.
export const aiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip),
  handler: (_req, res) => {
    res.status(429).json({ error: { message: 'Too many requests. Try again in a minute.', code: 'RATE_LIMITED' } });
  },
});
