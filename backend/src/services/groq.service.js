import Groq from 'groq-sdk';
import { z } from 'zod';
import { getGroq } from '../config/groq.js';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { ANALYZE_SYSTEM_PROMPT, buildAnalyzeUserMessage, buildEmailBlock } from '../prompts/analyze.prompt.js';
import { VERIFY_SYSTEM_PROMPT, buildVerifyUserMessage } from '../prompts/verify.prompt.js';
import { logger } from '../utils/logger.js';

const strategyFields = {
  headline: z.string().min(1).describe('The move in one line, under 15 words.'),
  psychology: z
    .string()
    .min(1)
    .describe('The negotiation principle this reply uses and why it fits this counterpart, in 1-2 sentences.'),
  draft: z
    .string()
    .min(1)
    .describe('Complete ready-to-send email body (greeting to sign-off), plain text, no subject line.'),
};

export const NegotiationStrategiesSchema = z.object({
  firmOffer: z.object(strategyFields).describe('Hold the core terms with warmth and reaffirmed value.'),
  creativeTradeoff: z
    .object({
      ...strategyFields,
      give: z.string().min(1).describe('What we concede, stated concretely.'),
      get: z.string().min(1).describe('What we ask for in return, stated concretely.'),
    })
    .describe('A concession traded for something of real value.'),
  urgencyDraft: z
    .object(strategyFields)
    .describe('A legitimate reason to decide now, ending with one clear next step.'),
});

// Strict mode: every property required, additionalProperties false (Zod emits both).
const { $schema, ...responseJsonSchema } = z.toJSONSchema(NegotiationStrategiesSchema);

// Strict schema output guarantees the shape; one extra attempt covers truncated or rejected generations.
const MAX_ATTEMPTS = 2;

/**
 * Asks Groq for the three negotiation strategies, then (unless VERIFY_DRAFTS=false)
 * runs a fact-check pass that rewrites claims the email doesn't support into placeholders.
 * Input: { emailText } or { thread }, plus optional { context }.
 * The model must support strict json_schema output on Groq (e.g. openai/gpt-oss-120b).
 */
export async function generateNegotiationStrategies({ emailText, thread, context }) {
  if (!process.env.GROQ_API_KEY) {
    throw new HttpError(500, 'The AI service is not configured correctly.', 'AI_AUTH_ERROR');
  }

  const drafts = await requestStrategies(ANALYZE_SYSTEM_PROMPT, buildAnalyzeUserMessage({ emailText, thread, context }));
  if (!env.verifyDrafts) return drafts;

  try {
    const emailMessage = buildEmailBlock({ emailText, thread, context });
    return await requestStrategies(VERIFY_SYSTEM_PROMPT, buildVerifyUserMessage({ emailMessage, strategies: drafts }));
  } catch (err) {
    // A failed fact-check shouldn't cost the user their analysis; the UI also asks them to review drafts.
    logger.warn(`Fact-check pass failed, returning unchecked drafts: ${err.cause?.message ?? err.message}`);
    return drafts;
  }
}

// One strict-JSON completion returning parsed strategies, with a retry for broken generations.
async function requestStrategies(systemPrompt, userMessage) {
  const groq = getGroq();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: env.groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'negotiation_strategies', strict: true, schema: responseJsonSchema },
        },
        // gpt-oss is a reasoning model; this budget covers its reasoning plus the JSON.
        max_completion_tokens: 8192,
        reasoning_effort: env.groqReasoningEffort,
      });
    } catch (err) {
      // Groq rejects a generation that broke the schema mid-way; a fresh attempt usually succeeds.
      if (isJsonValidateFailed(err) && attempt < MAX_ATTEMPTS) continue;
      throw toHttpError(err);
    }

    const choice = completion.choices[0];
    if (choice?.finish_reason === 'stop') {
      const result = NegotiationStrategiesSchema.safeParse(safeParseJson(choice.message.content));
      if (result.success) return result.data;
    }
  }

  throw new HttpError(502, 'The AI response was not in the expected format. Please try again.', 'AI_BAD_OUTPUT');
}

function isJsonValidateFailed(err) {
  return err instanceof Groq.BadRequestError && err.error?.error?.code === 'json_validate_failed';
}

function safeParseJson(text) {
  try {
    return JSON.parse(text ?? '');
  } catch {
    return null;
  }
}

// Map SDK errors for the client; the original stays on `cause` for logs.
function toHttpError(err) {
  let httpError;
  // Groq also reports tokens-per-minute overruns as non-429 errors with this code.
  if (err instanceof Groq.RateLimitError || err?.error?.error?.code === 'rate_limit_exceeded') {
    httpError = new HttpError(503, 'The AI service is busy. Please retry shortly.', 'AI_RATE_LIMITED');
  } else if (err instanceof Groq.AuthenticationError || err instanceof Groq.PermissionDeniedError) {
    httpError = new HttpError(500, 'The AI service is not configured correctly.', 'AI_AUTH_ERROR');
  } else if (err instanceof Groq.APIConnectionError) {
    httpError = new HttpError(503, 'Could not reach the AI service.', 'AI_UNAVAILABLE');
  } else if (err instanceof Groq.APIError) {
    httpError = new HttpError(502, 'The AI service returned an error.', 'AI_ERROR');
  } else {
    return err;
  }
  httpError.cause = err;
  return httpError;
}
