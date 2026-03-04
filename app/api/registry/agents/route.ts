import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, parseAbiItem, formatUnits } from "viem"
import { baseSepolia } from "viem/chains"
import { AgentIdentityABI, PaymentRouterABI } from "@/lib/abis"

const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`
const PAYMENT_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// GET /api/registry/agents - List all registered agents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const capability = searchParams.get("capability")
    
    // Get total supply
    const totalSupply = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "totalSupply",
    })

    // Fetch all agents
    const agents = []
    for (let i = 1; i <= Number(totalSupply); i++) {
      try {
        const metadata = await publicClient.readContract({
          address: AGENT_IDENTITY_ADDRESS,
          abi: AgentIdentityABI,
          functionName: "getAgentMetadata",
          args: [BigInt(i)],
        })
        
        const owner = await publicClient.readContract({
          address: AGENT_IDENTITY_ADDRESS,
          abi: AgentIdentityABI,
          functionName: "ownerOf",
          args: [BigInt(i)],
        })

        // Filter by capability if specified
        if (capability && !metadata.capabilities.includes(capability)) {
          continue
        }

        agents.push({
          id: i.toString(),
          name: metadata.name,
          endpoint: metadata.endpoint,
          capabilities: metadata.capabilities.split(",").map((c: string) => c.trim()),
          owner,
          active: metadata.active,
          createdAt: Number(metadata.createdAt) * 1000,
        })
      } catch (e) {
        // Skip invalid agents
      }
    }

    return NextResponse.json({
      agents,
      total: agents.length,
      capability: capability || null,
    })

  } catch (error) {
    console.error("Registry error:", error)
    return NextResponse.json(
      { agents: [], total: 0 },
      { status: 500 }
    )
  }
}
