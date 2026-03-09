export type AgentMessage = {
  id: string
  threadId: string
  from: string
  to: string
  kind: "proposal" | "counter" | "accept" | "reject" | "info"
  content: string
  createdAt: number
}

class MessageStore {
  private messages: AgentMessage[] = []

  add(message: Omit<AgentMessage, "id" | "createdAt">) {
    const record: AgentMessage = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...message,
    }

    this.messages.unshift(record)
    this.messages = this.messages.slice(0, 1000)
    return record
  }

  list(params?: { agentId?: string; threadId?: string; limit?: number }) {
    const { agentId, threadId, limit = 50 } = params || {}

    return this.messages
      .filter((m) => {
        if (threadId && m.threadId !== threadId) return false
        if (agentId && m.from !== agentId && m.to !== agentId) return false
        return true
      })
      .slice(0, limit)
  }
}

const globalStore = globalThis as unknown as { __agentlinkMessageStore?: MessageStore }

export const messageStore = globalStore.__agentlinkMessageStore ?? new MessageStore()

if (!globalStore.__agentlinkMessageStore) {
  globalStore.__agentlinkMessageStore = messageStore
}
