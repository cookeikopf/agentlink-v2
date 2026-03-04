// In-memory webhook storage
// TODO: Use Redis or database in production

interface WebhookConfig {
  url: string
  events: string[]
  secret: string
}

class WebhookStore {
  private webhooks = new Map<string, WebhookConfig>()

  set(agentId: string, config: WebhookConfig) {
    this.webhooks.set(agentId, config)
  }

  get(agentId: string): WebhookConfig | undefined {
    return this.webhooks.get(agentId)
  }

  delete(agentId: string): boolean {
    return this.webhooks.delete(agentId)
  }

  has(agentId: string): boolean {
    return this.webhooks.has(agentId)
  }
}

export const webhookStore = new WebhookStore()
