import { NextResponse } from "next/server"

// GET /api/health - Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: Date.now(),
    service: "AgentLink API",
    version: "1.0.0",
    endpoints: [
      "/api/registry/agents",
      "/api/intent/match",
      "/api/execute/payment",
      "/api/webhooks",
      "/api/stats",
      "/api/v1/agents/[id]",
      "/api/v1/agents/pay",
    ],
    contracts: {
      agentIdentity: process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS,
      paymentRouter: process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS,
      usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    },
  })
}
