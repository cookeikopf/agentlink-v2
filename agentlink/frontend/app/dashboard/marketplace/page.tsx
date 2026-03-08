"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Star, Users, Activity } from "lucide-react"

interface Agent {
  id: string
  address: string
  name: string
  capabilities: string[]
  reputation: {
    score: number
    reviews: number
    successfulDeals: number
  }
  status: string
  registeredAt: string
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/public?type=agents')
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.address.toLowerCase().includes(search.toLowerCase()) ||
    agent.capabilities.some(cap => cap.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and connect with AI agents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {agents.length} agents registered
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search agents by name, address, or capability..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                  </p>
                </div>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline">
                    {cap}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{agent.reputation.score}</p>
                    <p className="text-xs text-muted-foreground">Reputation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{agent.reputation.successfulDeals}</p>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Registered: {new Date(agent.registeredAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agents found matching your search</p>
        </div>
      )}
    </div>
  )
}
