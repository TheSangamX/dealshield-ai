import { Router } from 'express';
import { deleteDeal, getDeal, listDeals } from '../controllers/deals.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = Router();

router.use(requireAuth);
router.param('id', (_req, _res, next, id) =>
  next(UUID.test(id) ? undefined : new HttpError(404, 'Analysis not found.', 'NOT_FOUND')),
);

router.get('/', listDeals);
router.get('/:id', getDeal);
router.delete('/:id', deleteDeal);

export default router;
