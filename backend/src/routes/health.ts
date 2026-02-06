// Health Check API

import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// Simple health check
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch (error: any) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const [
      dbHealth,
      sessionCount,
      stepCount,
    ] = await Promise.all([
      prisma.$queryRaw`SELECT 1` 
        .then(() => ({ status: 'connected' }))
        .catch((err) => ({ status: 'error', message: err.message })),
      prisma.session.count(),
      prisma.step.count(),
    ]);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: dbHealth,
      },
      stats: {
        total_sessions: sessionCount,
        total_steps: stepCount,
      },
    });
  } catch (error: any) {
    logger.error(`Detailed health check failed: ${error.message}`);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
