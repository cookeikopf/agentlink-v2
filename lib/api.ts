import {
  Agent,
  Transaction,
  DashboardStats,
  RevenueData,
  ActivityItem,
  PaginatedResponse,
  AgentFilter,
  TransactionFilter,
  AgentMessage,
  ReputationProfile,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

class ApiClient {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`, { cache: "no-store" })
      if (response.ok) return await response.json()
    } catch (error) {
      console.error("Error fetching blockchain stats:", error)
    }

    return {
      totalAgents: 0,
      totalVolume: 0,
      totalTransactions: 0,
      activeAgents: 0,
      revenueChange: 0,
      transactionChange: 0,
      agentChange: 0,
    }
  }

  async getAgents(filter?: AgentFilter & { page?: number; limit?: number }): Promise<PaginatedResponse<Agent>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registry/agents`, { cache: "no-store" })
      const payload = await response.json()
      const rawAgents: any[] = payload?.agents || []

      const ownerIds = rawAgents.map((a) => a.owner).filter(Boolean).join(",")
      const repRes = ownerIds
        ? await fetch(`${API_BASE_URL}/api/reputation?agentIds=${encodeURIComponent(ownerIds)}`, { cache: "no-store" })
        : null
      const repPayload = repRes?.ok ? await repRes.json() : { reputations: [] }
      const repMap = new Map<string, ReputationProfile>(
        (repPayload.reputations || []).map((r: ReputationProfile) => [r.agentId.toLowerCase(), r])
      )

      const mapped: Agent[] = rawAgents.map((a) => {
        const rep = repMap.get(String(a.owner).toLowerCase())
        return {
          id: String(a.id),
          name: a.name,
          identity: String(a.owner),
          description: `Endpoint: ${a.endpoint}`,
          capabilities: a.capabilities || [],
          status: a.active ? "active" : "inactive",
          reputation: rep?.score ?? 2.5,
          totalRevenue: 0,
          totalTransactions: rep?.paymentsSent ?? 0,
          createdAt: new Date(a.createdAt).toISOString(),
          updatedAt: new Date(a.createdAt).toISOString(),
          owner: String(a.owner),
        }
      })

      const search = filter?.search?.toLowerCase().trim()
      let filtered = mapped.filter((agent) => {
        if (search && !`${agent.name} ${agent.identity}`.toLowerCase().includes(search)) return false
        if (filter?.status && filter.status !== "all" && agent.status !== filter.status) return false
        return true
      })

      if (filter?.sortBy) {
        const dir = filter.sortOrder === "asc" ? 1 : -1
        filtered = filtered.sort((a, b) => {
          switch (filter.sortBy) {
            case "name":
              return a.name.localeCompare(b.name) * dir
            case "revenue":
              return (a.totalRevenue - b.totalRevenue) * dir
            case "transactions":
              return (a.totalTransactions - b.totalTransactions) * dir
            case "created":
            default:
              return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
          }
        })
      }

      const page = filter?.page || 1
      const limit = filter?.limit || 10
      const start = (page - 1) * limit
      const data = filtered.slice(start, start + limit)

      return {
        data,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
      return { data: [], total: 0, page: filter?.page || 1, limit: filter?.limit || 10, totalPages: 0 }
    }
  }

  async getAgent(id: string): Promise<Agent | null> {
    const list = await this.getAgents({ page: 1, limit: 200 })
    return list.data.find((a) => a.id === id) || null
  }

  async getAgentTransactions(_: string): Promise<Transaction[]> {
    return []
  }

  async getTransactions(filter?: TransactionFilter & { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    return { data: [], total: 0, page: filter?.page || 1, limit: filter?.limit || 10, totalPages: 0 }
  }

  async getRevenueData(): Promise<RevenueData[]> {
    return []
  }

  async getActivityFeed(): Promise<ActivityItem[]> {
    return []
  }

  async getMessages(agentId?: string): Promise<AgentMessage[]> {
    const query = agentId ? `?agentId=${encodeURIComponent(agentId)}` : ""
    const res = await fetch(`${API_BASE_URL}/api/messages${query}`, { cache: "no-store" })
    if (!res.ok) return []
    const payload = await res.json()
    return payload.messages || []
  }

  async sendMessage(input: {
    from: string
    to: string
    content: string
    kind?: AgentMessage["kind"]
    threadId?: string
  }) {
    const res = await fetch(`${API_BASE_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error("Failed to send message")
    return await res.json()
  }

  async getReputations(agentIds: string[]): Promise<ReputationProfile[]> {
    if (agentIds.length === 0) return []
    const res = await fetch(
      `${API_BASE_URL}/api/reputation?agentIds=${encodeURIComponent(agentIds.join(","))}`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const payload = await res.json()
    return payload.reputations || []
  }
}

export const api = new ApiClient()
