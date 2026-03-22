import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

router.get('/', (_req, res) => {
  const dbStatus = db.getStatus();

  const healthy = dbStatus.connected;
  const statusCode = healthy ? 200 : 503;

  res.status(statusCode).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus.connected,
      readyState: dbStatus.readyState,
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heap: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
  });
});

export default router;
