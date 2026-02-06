// Agent Management APIs

import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// ============ GET /api/agents ============

router.get('/', async (req: Request, res: Response) => {
  try {
    // Get all agents with their latest stats
    const agents = await prisma.session.groupBy({
      by: ['agent_id'],
      _max: {
        start_time: true,
        total_tokens_in: true,
        total_tokens_out: true,
      },
      _count: {
        id: true,
      },
    });

    // Get success rate for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const [successCount, failedCount] = await Promise.all([
          prisma.session.count({
            where: { agent_id: agent.agent_id, status: 'success' },
          }),
          prisma.session.count({
            where: { agent_id: agent.agent_id, status: 'failed' },
          }),
        ]);

        const totalSessions = successCount + failedCount;
        return {
          agent_id: agent.agent_id,
          total_sessions: totalSessions,
          success_rate: totalSessions > 0 ? successCount / totalSessions : 0,
          last_active: agent._max.start_time,
          total_tokens_in: agent._max.total_tokens_in || 0,
          total_tokens_out: agent._max.total_tokens_out || 0,
        };
      })
    );

    res.json(agentsWithStats);
  } catch (error: any) {
    logger.error(`Error fetching agents: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET /api/agents/:agentId ============

router.get('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await prisma.session.groupBy({
      by: ['agent_id'],
      where: { agent_id: agentId },
      _max: {
        start_time: true,
        total_tokens_in: true,
        total_tokens_out: true,
      },
      _count: {
        id: true,
      },
    });

    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get recent sessions
    const recentSessions = await prisma.session.findMany({
      where: { agent_id: agentId },
      take: 10,
      orderBy: { start_time: 'desc' },
      select: {
        id: true,
        status: true,
        start_time: true,
        total_steps: true,
        total_tokens_in: true,
        total_tokens_out: true,
      },
    });

    // Get stats
    const [successCount, failedCount, avgSessionDuration] = await Promise.all([
      prisma.session.count({
        where: { agent_id: agentId, status: 'success' },
      }),
      prisma.session.count({
        where: { agent_id: agentId, status: 'failed' },
      }),
      prisma.session.aggregate({
        where: { agent_id: agentId, end_time: { not: null } },
        _avg: {
          total_steps: true,
        },
      }),
    ]);

    res.json({
      agent_id: agentId,
      total_sessions: successCount + failedCount,
      success_rate: successCount + failedCount > 0 
        ? successCount / (successCount + failedCount) 
        : 0,
      last_active: agent[0]._max.start_time,
      total_tokens_in: agent[0]._max.total_tokens_in || 0,
      total_tokens_out: agent[0]._max.total_tokens_out || 0,
      avg_steps_per_session: avgSessionDuration._avg.total_steps || 0,
      recent_sessions: recentSessions,
    });
  } catch (error: any) {
    logger.error(`Error fetching agent: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET /api/agents/:agentId/skills ============

router.get('/:agentId/skills', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const skills = await prisma.skillUsage.groupBy({
      by: ['skill_name', 'skill_type'],
      where: { agent_id: agentId },
      _count: {
        id: true,
      },
      _avg: {
        latency_ms: true,
      },
      _sum: {
        tokens_in: true,
        tokens_out: true,
      },
    });

    res.json(
      skills.map((skill) => ({
        skill_name: skill.skill_name,
        skill_type: skill.skill_type,
        usage_count: skill._count.id,
        avg_latency_ms: skill._avg.latency_ms || 0,
        total_tokens_in: skill._sum.tokens_in || 0,
        total_tokens_out: skill._sum.tokens_out || 0,
      }))
    );
  } catch (error: any) {
    logger.error(`Error fetching agent skills: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
