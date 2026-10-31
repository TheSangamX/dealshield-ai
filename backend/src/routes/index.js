import { Router } from 'express';
import analyzeRoutes from './analyze.routes.js';
import healthRoutes from './health.routes.js';
import meRoutes from './me.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/me', meRoutes);
router.use('/analyze', analyzeRoutes);

export default router;
