// Session Management APIs

import { Router, Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// ============ GET /api/sessions ============

router.get(
  '/',
  [
    query('agent_id').optional().isString(),
    query('status').optional().isIn(['success', 'failed', 'cancelled', 'timeout', 'running']),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        agent_id,
        status,
        from,
        to,
        limit = 50,
        offset = 0,
      } = req.query;

      const where: any = {};
      
      if (agent_id) where.agent_id = agent_id;
      if (status) where.status = status;
      if (from || to) {
        where.start_time = {};
        if (from) where.start_time.gte = new Date(from as string);
        if (to) where.start_time.lte = new Date(to as string);
      }

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          take: limit as number,
          skip: offset as number,
          orderBy: { start_time: 'desc' },
          select: {
            id: true,
            trace_id: true,
            agent_id: true,
            trigger_source: true,
            status: true,
            start_time: true,
            end_time: true,
            total_steps: true,
            total_tokens_in: true,
            total_tokens_out: true,
          },
        }),
        prisma.session.count({ where }),
      ]);

      res.json({
        data: sessions,
        pagination: {
          total,
          limit: limit,
          offset: offset,
          has_more: offset + sessions.length < total,
        },
      });
    } catch (error: any) {
      logger.error(`Error fetching sessions: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ GET /api/sessions/:sessionId ============

router.get(
  '/:sessionId',
  [param('sessionId').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          steps: {
            orderBy: { start_time: 'asc' },
          },
          llmCalls: {
            take: 10,
            orderBy: { created_at: 'desc' },
          },
          toolCalls: {
            take: 10,
            orderBy: { created_at: 'desc' },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error: any) {
      logger.error(`Error fetching session: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ GET /api/sessions/:sessionId/timeline ============

router.get(
  '/:sessionId/timeline',
  [param('sessionId').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          steps: {
            orderBy: { start_time: 'asc' },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Build timeline with related events
      const timeline = session.steps.map((step) => {
        return {
          step_id: step.id,
          step_type: step.step_type,
          skill_name: step.skill_name,
          status: step.status,
          start_time: step.start_time,
          end_time: step.end_time,
          duration_ms: step.duration_ms,
          llm_calls: step.step_type === 'llm' 
            ? prisma.llmCall.findMany({
                where: { step_id: step.id },
                select: { model: true, tokens_in: true, tokens_out: true, latency_ms: true },
              })
            : [],
          tool_calls: step.step_type === 'tool'
            ? prisma.toolCall.findMany({
                where: { step_id: step.id },
                select: { tool_name: true, status: true, latency_ms: true },
              })
            : [],
        };
      });

      res.json({
        session_id: sessionId,
        trace_id: session.trace_id,
        agent_id: session.agent_id,
        status: session.status,
        start_time: session.start_time,
        end_time: session.end_time,
        total_steps: session.total_steps,
        timeline,
      });
    } catch (error: any) {
      logger.error(`Error fetching session timeline: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ GET /api/sessions/:sessionId/stats ============

router.get(
  '/:sessionId/stats',
  [param('sessionId').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const [
        llmStats,
        toolStats,
        stepStats,
      ] = await Promise.all([
        prisma.llmCall.aggregate({
          where: { session_id: sessionId },
          _sum: { tokens_in: true, tokens_out: true },
          _avg: { latency_ms: true },
        }),
        prisma.toolCall.aggregate({
          where: { session_id: sessionId },
          _count: true,
          _avg: { latency_ms: true },
        }),
        prisma.step.groupBy({
          by: ['step_type', 'status'],
          where: { session_id: sessionId },
          _count: true,
        }),
      ]);

      res.json({
        session_id: sessionId,
        llm: {
          total_calls: 0, // Calculate from data
          total_tokens_in: llmStats._sum.tokens_in || 0,
          total_tokens_out: llmStats._sum.tokens_out || 0,
          avg_latency_ms: llmStats._avg.latency_ms || 0,
        },
        tools: {
          total_calls: toolStats._count || 0,
          avg_latency_ms: toolStats._avg.latency_ms || 0,
        },
        steps_by_type: stepStats,
      });
    } catch (error: any) {
      logger.error(`Error fetching session stats: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ DELETE /api/sessions/:sessionId ============

router.delete(
  '/:sessionId',
  [param('sessionId').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      await prisma.session.delete({
        where: { id: sessionId },
      });

      logger.info(`Session deleted: ${sessionId}`);
      res.json({ success: true, message: 'Session deleted' });
    } catch (error: any) {
      logger.error(`Error deleting session: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
