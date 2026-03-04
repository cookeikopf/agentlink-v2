import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, parseAbiItem } from "viem"
import { baseSepolia } from "viem/chains"
import { PaymentRouterABI } from "@/lib/abis"

const PAYMENT_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// In-memory webhook storage (use Redis/DB in production)
const webhooks = new Map<string, { url: string; events: string[]; secret: string }>()

// POST /api/webhooks/register - Register a webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentId, url, events, secret } = body

    if (!agentId || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Missing required fields: agentId, url, events" },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      )
    }

    // Store webhook
    webhooks.set(agentId, {
      url,
      events,
      secret: secret || generateSecret(),
    })

    return NextResponse.json({
      success: true,
      message: "Webhook registered successfully",
      agentId,
      events,
      secret: webhooks.get(agentId)?.secret,
    })

  } catch (error) {
    console.error("Webhook registration error:", error)
    return NextResponse.json(
      { error: "Failed to register webhook" },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/{agentId} - Get webhook info
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId required" },
        { status: 400 }
      )
    }

    const webhook = webhooks.get(agentId)
    
    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      agentId,
      url: webhook.url,
      events: webhook.events,
      // Don't return secret
    })

  } catch (error) {
    console.error("Webhook get error:", error)
    return NextResponse.json(
      { error: "Failed to get webhook" },
      { status: 500 }
    )
  }
}

// DELETE /api/webhooks/{agentId} - Remove webhook
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId required" },
        { status: 400 }
      )
    }

    webhooks.delete(agentId)

    return NextResponse.json({
      success: true,
      message: "Webhook removed successfully",
    })

  } catch (error) {
    console.error("Webhook delete error:", error)
    return NextResponse.json(
      { error: "Failed to remove webhook" },
      { status: 500 }
    )
  }
}

function generateSecret(): string {
  return "whsec_" + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Export for use in other routes
export { webhooks }
