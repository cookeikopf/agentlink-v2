/**
 * AgentLink Messaging Service
 * 
 * A2A (Agent-to-Agent) Messaging mit:
 * - Webhooks für Echtzeit-Benachrichtigungen
 * - Message Queue für zuverlässige Zustellung
 * - Delivery Guarantees (At-Least-Once)
 * - Message Signatures für Authentizität
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { ACTIVE_NETWORK } from './constants.js';

// Message Types
export enum MessageType {
  PAYMENT_INTENT = 'payment_intent',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  TASK_REQUEST = 'task_request',
  TASK_RESPONSE = 'task_response',
  AGENT_DISCOVERY = 'agent_discovery',
  REPUTATION_UPDATE = 'reputation_update',
  SYSTEM = 'system',
}

// Message Status
export enum MessageStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

// Message Interface
export interface A2AMessage {
  id: string;
  type: MessageType;
  from: string; // Agent ID or Address
  to: string;   // Agent ID or Address
  payload: any;
  timestamp: number;
  signature?: string;
  ttl?: number; // Time to live in seconds
  priority?: number; // 1-10, higher = more important
}

// Delivery Receipt
export interface DeliveryReceipt {
  messageId: string;
  status: MessageStatus;
  deliveredAt?: number;
  attempts: number;
  error?: string;
}

// Webhook Configuration
export interface WebhookConfig {
  url: string;
  secret: string;
  events: MessageType[];
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
}

// Agent Registration
export interface RegisteredAgent {
  id: string;
  address: `0x${string}`;
  webhook?: WebhookConfig;
  publicKey: string;
  lastSeen: number;
  capabilities: string[];
}

/**
 * Message Queue für zuverlässige Zustellung
 */
class MessageQueue {
  private queue: Map<string, A2AMessage> = new Map();
  private receipts: Map<string, DeliveryReceipt> = new Map();
  private processing: Set<string> = new Set();
  
  constructor(
    private maxRetries: number = 3,
    private backoffMs: number = 1000
  ) {}
  
  enqueue(message: A2AMessage): void {
    this.queue.set(message.id, message);
    this.receipts.set(message.id, {
      messageId: message.id,
      status: MessageStatus.PENDING,
      attempts: 0,
    });
  }
  
  dequeue(messageId: string): A2AMessage | undefined {
    const message = this.queue.get(messageId);
    this.queue.delete(messageId);
    return message;
  }
  
  getReceipt(messageId: string): DeliveryReceipt | undefined {
    return this.receipts.get(messageId);
  }
  
  updateReceipt(messageId: string, update: Partial<DeliveryReceipt>): void {
    const receipt = this.receipts.get(messageId);
    if (receipt) {
      Object.assign(receipt, update);
    }
  }
  
  async processWithRetry(
    messageId: string,
    processor: (message: A2AMessage) => Promise<boolean>
  ): Promise<boolean> {
    const message = this.queue.get(messageId);
    if (!message) return false;
    
    if (this.processing.has(messageId)) return false;
    this.processing.add(messageId);
    
    const receipt = this.receipts.get(messageId)!;
    
    while (receipt.attempts < this.maxRetries) {
      receipt.attempts++;
      receipt.status = MessageStatus.RETRYING;
      
      try {
        const success = await processor(message);
        
        if (success) {
          receipt.status = MessageStatus.DELIVERED;
          receipt.deliveredAt = Date.now();
          this.processing.delete(messageId);
          return true;
        }
      } catch (error) {
        receipt.error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      // Exponential backoff
      if (receipt.attempts < this.maxRetries) {
        await this.sleep(this.backoffMs * Math.pow(2, receipt.attempts - 1));
      }
    }
    
    receipt.status = MessageStatus.FAILED;
    this.processing.delete(messageId);
    return false;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getPendingMessages(): A2AMessage[] {
    return Array.from(this.queue.values()).filter(msg => {
      const receipt = this.receipts.get(msg.id);
      return receipt && receipt.status === MessageStatus.PENDING;
    });
  }
}

/**
 * Webhook Service für Echtzeit-Zustellung
 */
class WebhookService {
  private agents: Map<string, RegisteredAgent> = new Map();
  
  registerAgent(agent: RegisteredAgent): void {
    this.agents.set(agent.id, agent);
  }
  
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }
  
  async sendWebhook(
    agentId: string,
    message: A2AMessage
  ): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent || !agent.webhook) return false;
    
    const { url, secret } = agent.webhook;
    
    try {
      const payload = JSON.stringify({
        message,
        timestamp: Date.now(),
      });
      
      const signature = this.generateSignature(payload, secret);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Message-ID': message.id,
        },
        body: payload,
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Webhook failed for agent ${agentId}:`, error);
      return false;
    }
  }
  
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
  
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }
}

/**
 * A2A Messaging Service
 */
export class A2AMessagingService extends EventEmitter {
  private queue: MessageQueue;
  private webhookService: WebhookService;
  private agents: Map<string, RegisteredAgent> = new Map();
  private isRunning = false;
  
  constructor(
    private config: {
      maxRetries?: number;
      backoffMs?: number;
      pollIntervalMs?: number;
    } = {}
  ) {
    super();
    
    this.queue = new MessageQueue(
      config.maxRetries || 3,
      config.backoffMs || 1000
    );
    
    this.webhookService = new WebhookService();
  }
  
  /**
   * Starte den Messaging Service
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Starte Poll-Loop für pending messages
    this.pollLoop();
    
    this.emit('started');
  }
  
  /**
   * Stoppe den Messaging Service
   */
  stop(): void {
    this.isRunning = false;
    this.emit('stopped');
  }
  
  /**
   * Registriere einen Agenten
   */
  registerAgent(agent: RegisteredAgent): void {
    this.agents.set(agent.id, agent);
    this.webhookService.registerAgent(agent);
    this.emit('agent:registered', agent);
  }
  
  /**
   * Sende eine Nachricht an einen Agenten
   */
  async sendMessage(
    from: string,
    to: string,
    type: MessageType,
    payload: any,
    options: {
      ttl?: number;
      priority?: number;
    } = {}
  ): Promise<string> {
    const message: A2AMessage = {
      id: this.generateMessageId(),
      type,
      from,
      to,
      payload,
      timestamp: Date.now(),
      signature: await this.signMessage(from, payload),
      ttl: options.ttl || 300, // Default 5 minutes
      priority: options.priority || 5,
    };
    
    // Validierung
    if (!this.validateMessage(message)) {
      throw new Error('Invalid message');
    }
    
    // In Queue einfügen
    this.queue.enqueue(message);
    
    this.emit('message:sent', message);
    
    return message.id;
  }
  
  /**
   * Prüfe Delivery Status
   */
  getDeliveryStatus(messageId: string): DeliveryReceipt | undefined {
    return this.queue.getReceipt(messageId);
  }
  
  /**
   * Verarbeite eingehende Webhook-Nachrichten
   */
  async handleIncomingWebhook(
    agentId: string,
    payload: any,
    signature: string
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent || !agent.webhook) {
      throw new Error('Agent not found or no webhook configured');
    }
    
    // Verifiziere Signatur
    const payloadStr = JSON.stringify(payload);
    if (!this.webhookService.verifySignature(payloadStr, signature, agent.webhook.secret)) {
      throw new Error('Invalid signature');
    }
    
    const message = payload.message as A2AMessage;
    
    // Validiere Nachricht
    if (!this.validateMessage(message)) {
      throw new Error('Invalid message format');
    }
    
    this.emit('message:received', message);
  }
  
  /**
   * Private Methods
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  private async signMessage(from: string, payload: any): Promise<string> {
    // In Production: Sign with agent's private key
    // Hier: Mock signature for demo
    const data = JSON.stringify({ from, payload, timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private validateMessage(message: A2AMessage): boolean {
    // Pflichtfelder prüfen
    if (!message.id || !message.type || !message.from || !message.to) {
      return false;
    }
    
    // TTL prüfen
    if (message.ttl && message.timestamp + message.ttl * 1000 < Date.now()) {
      return false;
    }
    
    // Agent existiert
    if (!this.agents.has(message.to)) {
      return false;
    }
    
    return true;
  }
  
  private async pollLoop(): Promise<void> {
    while (this.isRunning) {
      const pending = this.queue.getPendingMessages();
      
      for (const message of pending) {
        await this.deliverMessage(message);
      }
      
      await this.sleep(this.config.pollIntervalMs || 5000);
    }
  }
  
  private async deliverMessage(message: A2AMessage): Promise<void> {
    const success = await this.queue.processWithRetry(
      message.id,
      async (msg) => {
        // Versuche Webhook
        const webhookSuccess = await this.webhookService.sendWebhook(
          msg.to,
          msg
        );
        
        if (webhookSuccess) {
          this.emit('message:delivered', msg);
          return true;
        }
        
        return false;
      }
    );
    
    if (!success) {
      this.emit('message:failed', message);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export für Nutzung
export default A2AMessagingService;
