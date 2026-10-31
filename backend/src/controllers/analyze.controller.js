import { generateNegotiationStrategies } from '../services/groq.service.js';
import { recordUsage } from '../services/usage.service.js';

// POST /api/analyze → { data: { firmOffer, creativeTradeoff, urgencyDraft } }
export async function analyzeEmail(req, res) {
  const strategies = await generateNegotiationStrategies(req.body);
  await recordUsage(req.user.id, 'analyze'); // only successful analyses count toward the quota
  res.json({ data: strategies });
}
