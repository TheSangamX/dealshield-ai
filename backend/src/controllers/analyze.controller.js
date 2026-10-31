import { saveAnalysis } from '../services/deals.service.js';
import { generateNegotiationStrategies } from '../services/groq.service.js';
import { recordUsage } from '../services/usage.service.js';

// POST /api/analyze → { data: { firmOffer, creativeTradeoff, urgencyDraft }, meta: { analysisId } }
export async function analyzeEmail(req, res) {
  const strategies = await generateNegotiationStrategies(req.body);
  // Only successful analyses count toward the quota and land in history.
  const [, analysisId] = await Promise.all([
    recordUsage(req.user.id, 'analyze'),
    saveAnalysis({ user: req.user, thread: req.body.thread, result: strategies }),
  ]);
  res.json({ data: strategies, meta: { analysisId } });
}
