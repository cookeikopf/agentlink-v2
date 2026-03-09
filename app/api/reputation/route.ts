import { NextRequest, NextResponse } from "next/server"
import { reputationStore } from "@/lib/reputation-store"
import { messageStore } from "@/lib/message-store"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentIdsParam = searchParams.get("agentIds")

    if (!agentIdsParam) {
      return NextResponse.json({ reputations: [] })
    }

    const agentIds = agentIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    const reputations = reputationStore.list(agentIds).map((rep) => {
      const msgs = messageStore.list({ agentId: rep.agentId, limit: 500 })
      const sent = msgs.filter((m) => m.from === rep.agentId).length
      const received = msgs.filter((m) => m.to === rep.agentId).length
      return { ...rep, messagesSent: sent, messagesReceived: received }
    })
    return NextResponse.json({ reputations })
  } catch (error) {
    console.error("Reputation GET error:", error)
    return NextResponse.json({ error: "Failed to fetch reputations" }, { status: 500 })
  }
}
