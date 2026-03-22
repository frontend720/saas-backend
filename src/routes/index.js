import { Router } from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import assetRoutes from './assets.js';
import adminRoutes from './admin.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects/:projectId/assets', assetRoutes);
router.use('/admin', adminRoutes);

export default router;
