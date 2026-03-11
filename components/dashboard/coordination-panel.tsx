"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquare, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export function CoordinationPanel() {
  const queryClient = useQueryClient()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [content, setContent] = useState("")

  const { data: messages = [] } = useQuery({ queryKey: ["agent-messages"], queryFn: () => api.getMessages() })

  const sendMutation = useMutation({
    mutationFn: () => api.sendMessage({ from, to, content, kind: "proposal" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-messages"] })
      setContent("")
    },
  })

  const latest = useMemo(() => messages.slice(0, 6), [messages])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Agent Coordination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From agent/address" />
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To agent/address" />
          <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Negotiation message" />
        </div>
        <Button
          onClick={() => sendMutation.mutate()}
          disabled={!from || !to || !content || sendMutation.isPending}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send message
        </Button>

        <div className="space-y-2">
          {latest.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agent messages yet.</p>
          ) : (
            latest.map((m) => (
              <div key={m.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{m.from} → {m.to}</p>
                <p className="text-muted-foreground">{m.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
