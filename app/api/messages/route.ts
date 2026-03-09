import { NextRequest, NextResponse } from "next/server"
import { messageStore } from "@/lib/message-store"
import { reputationStore } from "@/lib/reputation-store"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from, to, content, kind = "info", threadId } = body

    if (!from || !to || !content) {
      return NextResponse.json({ error: "Missing required fields: from, to, content" }, { status: 400 })
    }

    const message = messageStore.add({
      from,
      to,
      content,
      kind,
      threadId: threadId || `${from}:${to}`,
    })

    reputationStore.recordMessage(from, to)
    if (kind === "accept") {
      reputationStore.recordNegotiationWin(from)
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Message POST error:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId") || undefined
    const threadId = searchParams.get("threadId") || undefined
    const limit = Number(searchParams.get("limit") || "50")

    const messages = messageStore.list({ agentId, threadId, limit })

    return NextResponse.json({
      count: messages.length,
      messages,
    })
  } catch (error) {
    console.error("Message GET error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
