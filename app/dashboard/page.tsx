"use client"

import { useQuery } from "@tanstack/react-query"
import { Bot, Receipt, TrendingUp, Users } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TransactionVolumeChart } from "@/components/dashboard/transaction-volume-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { TopAgents } from "@/components/dashboard/top-agents"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardStats,
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-data'],
    queryFn: api.getRevenueData,
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: api.getActivityFeed,
  })

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.getAgents(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time blockchain data from Base Sepolia
        </p>
      </div>

      {/* Stats Cards - REAL DATA */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </>
        ) : stats ? (
          <>
            <StatsCard
              title="Total Agents"
              value={stats.totalAgents}
              change={stats.agentChange}
              icon={<Bot className="h-5 w-5" />}
            />
            <StatsCard
              title="Active Agents"
              value={stats.activeAgents}
              change={0}
              icon={<Users className="h-5 w-5" />}
            />
            <StatsCard
              title="Total Volume (USDC)"
              value={stats.totalVolume}
              change={stats.revenueChange}
              format="currency"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatsCard
              title="Transactions"
              value={stats.totalTransactions}
              change={stats.transactionChange}
              icon={<Receipt className="h-5 w-5" />}
            />
          </>
        ) : null}
      </div>

      {/* Charts - Show message if no data */}
      <div className="grid gap-6 lg:grid-cols-3">
        {revenueLoading ? (
          <Skeleton className="col-span-2 h-[400px]" />
        ) : revenueData && revenueData.length > 0 ? (
          <RevenueChart data={revenueData} />
        ) : (
          <div className="col-span-2 flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No revenue data available yet</p>
          </div>
        )}
        
        {revenueLoading ? (
          <Skeleton className="h-[400px]" />
        ) : revenueData && revenueData.length > 0 ? (
          <TransactionVolumeChart data={revenueData} />
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No volume data available yet</p>
          </div>
        )}
      </div>

      {/* Activity & Top Agents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {activitiesLoading ? (
          <Skeleton className="h-[400px]" />
        ) : activities && activities.length > 0 ? (
          <ActivityFeed activities={activities} />
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No activity yet</p>
          </div>
        )}
        
        {agentsLoading ? (
          <Skeleton className="h-[400px]" />
        ) : agentsData && agentsData.data.length > 0 ? (
          <TopAgents agents={agentsData.data} />
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No agents registered yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
