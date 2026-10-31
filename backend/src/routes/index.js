import { Router } from 'express';
import analyzeRoutes from './analyze.routes.js';
import billingRoutes from './billing.routes.js';
import dealsRoutes from './deals.routes.js';
import healthRoutes from './health.routes.js';
import meRoutes from './me.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/me', meRoutes);
router.use('/analyze', analyzeRoutes);
router.use('/deals', dealsRoutes);
router.use('/billing', billingRoutes);

export default router;
