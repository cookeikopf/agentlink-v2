import { NextResponse } from "next/server"

const requiredEnv = [
  "NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS",
  "NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS",
  "NEXT_PUBLIC_USDC_ADDRESS",
  "NEXT_PUBLIC_RPC_URL",
  "NEXT_PUBLIC_CHAIN_ID",
]

export const dynamic = "force-dynamic"

// GET /api/health - Health and deployment-readiness endpoint
export async function GET() {
  const missingEnv = requiredEnv.filter((envName) => !process.env[envName])

  return NextResponse.json({
    status: missingEnv.length === 0 ? "ok" : "degraded",
    timestamp: Date.now(),
    service: "AgentLink API",
    version: "1.0.0",
    readiness: {
      deploymentReady: missingEnv.length === 0,
      missingEnv,
    },
    endpoints: [
      "/api/registry/agents",
      "/api/intent/match",
      "/api/execute/payment",
      "/api/webhooks",
      "/api/stats",
      "/api/messages",
      "/api/reputation",
      "/api/negotiation/simulate",
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
