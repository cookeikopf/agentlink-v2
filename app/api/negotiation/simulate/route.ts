import { NextRequest, NextResponse } from "next/server"
import { reputationStore } from "@/lib/reputation-store"

export const dynamic = "force-dynamic"

// POST /api/negotiation/simulate
// Provides a deterministic recommendation for fee, escrow requirement and SLA class.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requester, provider, amount } = body

    if (!requester || !provider || !amount) {
      return NextResponse.json({ error: "requester, provider, amount are required" }, { status: 400 })
    }

    const reqRep = reputationStore.get(requester)
    const provRep = reputationStore.get(provider)

    const riskIndex = Number((5 - (reqRep.score + provRep.score) / 2).toFixed(2))
    const baseFeeBps = 120
    const riskPremiumBps = Math.max(0, Math.round(riskIndex * 25))
    const recommendedFeeBps = baseFeeBps + riskPremiumBps

    const escrowRatio = riskIndex > 2.5 ? 0.35 : riskIndex > 1.5 ? 0.2 : 0.1
    const escrowAmount = Number(amount) * escrowRatio

    const slaTier = riskIndex > 2.5 ? "strict" : riskIndex > 1.5 ? "standard" : "fast"

    return NextResponse.json({
      requester,
      provider,
      amount,
      recommendation: {
        riskIndex,
        recommendedFeeBps,
        escrowRatio,
        escrowAmount: Number(escrowAmount.toFixed(6)),
        slaTier,
      },
    })
  } catch (error) {
    console.error("Negotiation simulation error:", error)
    return NextResponse.json({ error: "Failed to simulate negotiation" }, { status: 500 })
  }
}
