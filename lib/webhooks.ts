// Webhook dispatcher utility
// In production, this would use a queue system like Bull/BullMQ

import { webhookStore } from "./webhook-store"

export interface WebhookEvent {
  type: string
  timestamp: number
  data: Record<string, unknown>
}

export async function dispatchWebhook(agentId: string, event: WebhookEvent) {
  const webhook = webhookStore.get(agentId)
  
  if (!webhook) {
    console.log(`No webhook registered for agent ${agentId}`)
    return
  }

  // Check if agent subscribed to this event type
  if (!webhook.events.includes(event.type) && !webhook.events.includes("*")) {
    return
  }

  try {
    const payload = {
      ...event,
      webhookId: agentId,
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": webhook.secret,
        "X-Webhook-Event": event.type,
        "X-Webhook-Timestamp": event.timestamp.toString(),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Webhook delivery failed for agent ${agentId}:`, response.status)
    } else {
      console.log(`Webhook delivered to agent ${agentId}:`, event.type)
    }

  } catch (error) {
    console.error(`Webhook delivery error for agent ${agentId}:`, error)
  }
}

// Helper functions for common events
export function notifyPaymentReceived(
  agentId: string, 
  data: {
    from: string
    amount: string
    memo: string
    txHash: string
  }
) {
  dispatchWebhook(agentId, {
    type: "payment.received",
    timestamp: Date.now(),
    data,
  })
}

export function notifyPaymentSent(
  agentId: string,
  data: {
    to: string
    amount: string
    memo: string
    txHash: string
  }
) {
  dispatchWebhook(agentId, {
    type: "payment.sent",
    timestamp: Date.now(),
    data,
  })
}

export function notifyAgentRegistered(
  agentId: string,
  data: {
    name: string
    capabilities: string[]
    owner: string
  }
) {
  dispatchWebhook(agentId, {
    type: "agent.registered",
    timestamp: Date.now(),
    data,
  })
}
