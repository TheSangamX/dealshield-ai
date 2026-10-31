import { HttpError } from '../middleware/errorHandler.js';
import { deleteAnalysis, getAnalysis, listAnalyses } from '../services/deals.service.js';

// GET /api/deals → { data: [{ id, subject, counterpart_name, counterpart_email, created_at }] }
export async function listDeals(req, res) {
  res.json({ data: await listAnalyses(req.user.id) });
}

// GET /api/deals/:id → { data: { ...summary, result: { firmOffer, creativeTradeoff, urgencyDraft } } }
export async function getDeal(req, res) {
  const deal = await getAnalysis(req.user.id, req.params.id);
  if (!deal) throw new HttpError(404, 'Analysis not found.', 'NOT_FOUND');
  res.json({ data: deal });
}

// DELETE /api/deals/:id → { data: { deleted: true } }
export async function deleteDeal(req, res) {
  const deleted = await deleteAnalysis(req.user.id, req.params.id);
  if (!deleted) throw new HttpError(404, 'Analysis not found.', 'NOT_FOUND');
  res.json({ data: { deleted: true } });
}
