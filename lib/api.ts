import { 
  Agent, 
  Transaction, 
  DashboardStats, 
  RevenueData, 
  ActivityItem,
  PaginatedResponse,
  AgentFilter,
  TransactionFilter 
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// API Client for real blockchain data
class ApiClient {
  // Real blockchain stats from API
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching blockchain stats:', error)
    }
    
    // Return empty data if API fails
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

  // Get agents from blockchain
  async getAgents(filter?: AgentFilter & { page?: number; limit?: number }): Promise<PaginatedResponse<Agent>> {
    // TODO: Implement real blockchain query
    // For now return empty
    return {
      data: [],
      total: 0,
      page: filter?.page || 1,
      limit: filter?.limit || 10,
      totalPages: 0,
    }
  }

  async getAgent(id: string): Promise<Agent | null> {
    // TODO: Query specific agent from blockchain
    return null
  }

  async getAgentTransactions(id: string): Promise<Transaction[]> {
    // TODO: Query transactions from blockchain events
    return []
  }

  async getTransactions(filter?: TransactionFilter & { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    // TODO: Query transactions from blockchain
    return {
      data: [],
      total: 0,
      page: filter?.page || 1,
      limit: filter?.limit || 10,
      totalPages: 0,
    }
  }

  async getRevenueData(): Promise<RevenueData[]> {
    // Return empty until we have real data
    return []
  }

  async getActivityFeed(): Promise<ActivityItem[]> {
    // Return empty until we have real events
    return []
  }
}

export const api = new ApiClient()
