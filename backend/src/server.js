import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

app.listen(env.port, () => {
  logger.info(`DealShield API listening on http://localhost:${env.port} (model: ${env.groqModel})`);
  if (!process.env.GROQ_API_KEY) {
    logger.warn('GROQ_API_KEY is not set: /api/analyze will fail.');
  }
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    logger.warn('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set: signed-in routes will return 500.');
  }
});
