import { NextResponse } from "next/server"
import { getAgentStats, getPaymentStats } from "@/lib/blockchain"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [agentStats, paymentStats] = await Promise.all([
      getAgentStats(),
      getPaymentStats(),
    ])

    return NextResponse.json({
      ...agentStats,
      ...paymentStats,
      revenueChange: 0,
      transactionChange: 0,
      agentChange: 0,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
