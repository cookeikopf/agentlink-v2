"use client"

import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Agent } from "@/types"

export function ReputationPanel({ agents }: { agents: Agent[] }) {
  const top = [...agents].sort((a, b) => b.reputation - a.reputation).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Reputation Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reputation data yet.</p>
        ) : (
          top.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span className="font-medium">{a.name}</span>
              <span>{a.reputation.toFixed(2)} / 5</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
