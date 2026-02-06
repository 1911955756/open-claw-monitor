// OpenClaw Agent Ops Dashboard - Express Server

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import telemetryRoutes from './routes/telemetry';
import sessionRoutes from './routes/sessions';
import agentRoutes from './routes/agents';
import healthRoutes from './routes/health';
import { logger } from './utils/logger';

// Initialize Prisma
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.use('/api/health', healthRoutes);

// Telemetry Ingest API
app.use('/api/telemetry', telemetryRoutes);

// Session APIs
app.use('/api/sessions', sessionRoutes);

// Agent APIs
app.use('/api/agents', agentRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 OpenClaw Monitor API running on port ${PORT}`);
  logger.info(`📊 Dashboard: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
