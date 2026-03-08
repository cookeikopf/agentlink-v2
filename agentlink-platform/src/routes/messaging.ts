/**
 * AgentLink Messaging API Routes
 * 
 * REST API für Agent-to-Agent Messaging
 * 
 * Endpoints:
 * - POST /api/v1/messages/send - Sende Nachricht
 * - GET /api/v1/messages/:id/status - Prüfe Status
 * - POST /api/v1/webhook/:agentId - Empfange Webhook
 * - POST /api/v1/agents/register - Registriere Agent
 */

import { Router } from 'express';
import { z } from 'zod';
import { A2AMessagingService, MessageType } from '../messaging.js';

// Initialize messaging service
const messagingService = new A2AMessagingService({
  maxRetries: 3,
  backoffMs: 1000,
  pollIntervalMs: 5000,
});

messagingService.start();

// Validation schemas
const sendMessageSchema = z.object({
  to: z.string().min(1),
  type: z.enum([
    'payment_intent',
    'payment_confirmed',
    'task_request',
    'task_response',
    'agent_discovery',
    'reputation_update',
    'system',
  ]),
  payload: z.record(z.any()),
  ttl: z.number().optional(),
  priority: z.number().min(1).max(10).optional(),
});

const registerAgentSchema = z.object({
  id: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  publicKey: z.string(),
  capabilities: z.array(z.string()),
  webhook: z.object({
    url: z.string().url(),
    secret: z.string().min(16),
    events: z.array(z.string()),
    retryPolicy: z.object({
      maxRetries: z.number(),
      backoffMs: z.number(),
    }),
  }).optional(),
});

// Create router
const router = Router();

/**
 * POST /api/v1/messages/send
 * Sende eine Nachricht an einen Agenten
 */
router.post('/send', async (req, res) => {
  try {
    // Validate request
    const validated = sendMessageSchema.parse(req.body);
    
    // Get sender from API key or authentication
    const from = req.headers['x-agent-id'] as string;
    if (!from) {
      return res.status(401).json({
        error: 'Missing X-Agent-ID header',
      });
    }
    
    // Send message
    const messageId = await messagingService.sendMessage(
      from,
      validated.to,
      validated.type as MessageType,
      validated.payload,
      {
        ttl: validated.ttl,
        priority: validated.priority,
      }
    );
    
    res.status(202).json({
      success: true,
      messageId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      error: 'Failed to send message',
    });
  }
});

/**
 * GET /api/v1/messages/:id/status
 * Prüfe Status einer Nachricht
 */
router.get('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    
    const receipt = messagingService.getDeliveryStatus(id);
    
    if (!receipt) {
      return res.status(404).json({
        error: 'Message not found',
      });
    }
    
    res.json({
      messageId: receipt.messageId,
      status: receipt.status,
      attempts: receipt.attempts,
      deliveredAt: receipt.deliveredAt,
      error: receipt.error,
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({
      error: 'Failed to check status',
    });
  }
});

/**
 * POST /api/v1/agents/register
 * Registriere einen neuen Agenten
 */
router.post('/agents/register', (req, res) => {
  try {
    const validated = registerAgentSchema.parse(req.body);
    
    messagingService.registerAgent({
      id: validated.id,
      address: validated.address as `0x${string}`,
      publicKey: validated.publicKey,
      capabilities: validated.capabilities,
      webhook: validated.webhook,
      lastSeen: Date.now(),
    });
    
    res.status(201).json({
      success: true,
      agentId: validated.id,
      message: 'Agent registered successfully',
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      error: 'Failed to register agent',
    });
  }
});

/**
 * POST /api/v1/webhook/:agentId
 * Empfange Webhook von externen Agenten
 */
router.post('/webhook/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (!signature) {
      return res.status(401).json({
        error: 'Missing X-Webhook-Signature header',
      });
    }
    
    await messagingService.handleIncomingWebhook(
      agentId,
      req.body,
      signature
    );
    
    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    
    res.status(400).json({
      error: 'Invalid webhook',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/v1/agents/:id
 * Get agent info
 */
router.get('/agents/:id', (req, res) => {
  // TODO: Implement agent info retrieval
  res.json({
    agentId: req.params.id,
    status: 'active',
  });
});

export default router;
