import { Router } from 'express';
import { z } from 'zod';
import { analyzeEmail } from '../controllers/analyze.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { aiRateLimit } from '../middleware/rateLimit.js';
import { requireQuota } from '../middleware/subscription.js';
import { validateBody } from '../middleware/validate.js';

const MAX_EMAIL_CHARS = 50_000;

// Accepts raw text, or the thread object the extension's content script captures.
export const analyzeRequestSchema = z
  .object({
    emailText: z.string().trim().min(1).max(MAX_EMAIL_CHARS).optional(),
    thread: z
      .object({
        subject: z.string().optional(),
        messages: z
          .array(
            z.object({
              sender: z.object({ name: z.string().optional(), email: z.string().optional() }).optional(),
              date: z.string().optional(),
              body: z.string().max(MAX_EMAIL_CHARS),
            }),
          )
          .min(1)
          .max(50),
      })
      .optional(),
    context: z.string().trim().max(2000).optional(),
  })
  .refine((body) => body.emailText || body.thread, {
    message: 'Provide either "emailText" or "thread".',
  });

const router = Router();

router.post('/', requireAuth, aiRateLimit, validateBody(analyzeRequestSchema), requireQuota, analyzeEmail);

export default router;
