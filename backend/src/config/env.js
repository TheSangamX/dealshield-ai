export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  // low | medium | high (gpt-oss reasoning depth; higher follows the no-invented-facts rules more closely)
  groqReasoningEffort: process.env.GROQ_REASONING_EFFORT || 'medium',
  // Second Groq call that rewrites unsupported claims into placeholders (about doubles latency and tokens).
  verifyDrafts: process.env.VERIFY_DRAFTS !== 'false',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  freeMonthlyLimit: Number(process.env.FREE_MONTHLY_ANALYSES) || 10,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
