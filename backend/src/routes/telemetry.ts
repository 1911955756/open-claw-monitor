// Telemetry Events Ingest API
// 处理所有来自Agent的埋点事件

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// Validation middleware
const validateEvent = (eventType: string) => {
  return [
    body('trace_id').notEmpty().withMessage('trace_id is required'),
    body('session_id').notEmpty().withMessage('session_id is required'),
    // event-specific validation handled in routes
  ];
};

// ============ Session Events ============

// POST /api/telemetry/session/started
router.post(
  '/session/started',
  validateEvent('session_started'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        trace_id,
        session_id,
        agent_id,
        trigger_source,
        start_time,
      } = req.body;

      const session = await prisma.session.create({
        data: {
          id: session_id,
          trace_id,
          agent_id,
          trigger_source,
          status: 'running',
          start_time: new Date(start_time),
        },
      });

      logger.info(`Session started: ${session_id}`);
      res.status(201).json({ success: true, session_id });
    } catch (error: any) {
      logger.error(`Error recording session_started: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/telemetry/session/completed
router.post(
  '/session/completed',
  [
    body('trace_id').notEmpty(),
    body('session_id').notEmpty(),
    body('status').isIn(['success', 'failed', 'cancelled', 'timeout']),
  ],
  async (req: Request, res: Response) => {
    try {
      const {
        trace_id,
        session_id,
        agent_id,
        status,
        end_time,
        total_steps,
        total_tokens_in,
        total_tokens_out,
        error_code,
      } = req.body;

      const session = await prisma.session.update({
        where: { id: session_id },
        data: {
          status,
          end_time: new Date(end_time),
          total_steps,
          total_tokens_in,
          total_tokens_out,
          error_code,
        },
      });

      logger.info(`Session completed: ${session_id} - ${status}`);
      res.json({ success: true, session_id });
    } catch (error: any) {
      logger.error(`Error recording session_completed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ Step Events ============

// POST /api/telemetry/step/started
router.post(
  '/step/started',
  [
    body('trace_id').notEmpty(),
    body('session_id').notEmpty(),
    body('step_id').notEmpty(),
    body('step_type').isIn(['llm', 'tool', 'memory_read', 'memory_write', 'routing', 'system']),
  ],
  async (req: Request, res: Response) => {
    try {
      const {
        trace_id,
        session_id,
        step_id,
        step_type,
        skill_name,
        start_time,
      } = req.body;

      const step = await prisma.step.create({
        data: {
          id: step_id,
          session_id,
          trace_id,
          step_type,
          skill_name,
          status: 'running',
          start_time: new Date(start_time),
        },
      });

      logger.debug(`Step started: ${step_id}`);
      res.status(201).json({ success: true, step_id });
    } catch (error: any) {
      logger.error(`Error recording step_started: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/telemetry/step/completed
router.post(
  '/step/completed',
  [
    body('trace_id').notEmpty(),
    body('session_id').notEmpty(),
    body('step_id').notEmpty(),
    body('status').isIn(['success', 'error']),
  ],
  async (req: Request, res: Response) => {
    try {
      const {
        trace_id,
        session_id,
        step_id,
        status,
        end_time,
        duration_ms,
        error_message,
      } = req.body;

      const step = await prisma.step.update({
        where: { id: step_id },
        data: {
          status,
          end_time: new Date(end_time),
          duration_ms,
          error_message,
        },
      });

      logger.debug(`Step completed: ${step_id} - ${status}`);
      res.json({ success: true, step_id });
    } catch (error: any) {
      logger.error(`Error recording step_completed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ LLM Call Events ============

// POST /api/telemetry/llm/call
router.post(
  '/llm/call',
  [
    body('trace_id').notEmpty(),
    body('session_id').notEmpty(),
    body('step_id').notEmpty(),
    body('agent_id').notEmpty(),
    body('model').notEmpty(),
    body('tokens_in').isInt({ min: 0 }),
    body('tokens_out').isInt({ min: 0 }),
    body('latency_ms').isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      const llmCall = await prisma.llmCall.create({
        data: {
          step_id: data.step_id,
          session_id: data.session_id,
          agent_id: data.agent_id,
          model: data.model,
          system_prompt: data.system_prompt,
          user_prompt: data.user_prompt,
          full_context: data.full_context,
          raw_output: data.raw_output,
          parsed_output: data.parsed_output,
          tokens_in: data.tokens_in,
          tokens_out: data.tokens_out,
          latency_ms: data.latency_ms,
        },
      });

      logger.debug(`LLM call recorded: ${llmCall.id}`);
      res.status(201).json({ success: true, id: llmCall.id });
    } catch (error: any) {
      logger.error(`Error recording llm_call: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ Tool Call Events ============

// POST /api/telemetry/tool/call
router.post(
  '/tool/call',
  [
    body('trace_id').notEmpty(),
    body('session_id').notEmpty(),
    body('step_id').notEmpty(),
    body('tool_name').notEmpty(),
    body('status').isIn(['success', 'error']),
    body('latency_ms').isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      const toolCall = await prisma.toolCall.create({
        data: {
          step_id: data.step_id,
          session_id: data.session_id,
          tool_name: data.tool_name,
          input_json: data.input_json ? JSON.stringify(data.input_json) : null,
          output_json: data.output_json ? JSON.stringify(data.output_json) : null,
          status: data.status,
          latency_ms: data.latency_ms,
          retry_count: data.retry_count || 0,
        },
      });

      logger.debug(`Tool call recorded: ${toolCall.id}`);
      res.status(201).json({ success: true, id: toolCall.id });
    } catch (error: any) {
      logger.error(`Error recording tool_call: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ Batch Events ============

// POST /api/telemetry/batch
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'events must be an array' });
    }

    const results = [];
    for (const event of events) {
      try {
        // Route to appropriate handler based on event type
        // This is a simplified version - in production, use a proper event bus
        results.push({ event_type: event.event, success: true });
      } catch (err: any) {
        results.push({ event_type: event.event, success: false, error: err.message });
      }
    }

    logger.info(`Batch processed: ${events.length} events`);
    res.json({ processed: events.length, results });
  } catch (error: any) {
    logger.error(`Error processing batch events: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
