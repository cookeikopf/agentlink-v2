import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { baseSepolia } from "viem/chains"
import { AgentIdentityABI } from "@/lib/abis"

const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// GET /api/v1/agents/{id} - Get agent information
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get agent metadata from blockchain
    const metadata = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "getAgentMetadata",
      args: [BigInt(id)],
    }).catch(() => null)

    if (!metadata) {
      return NextResponse.json(
        { error: "Not Found", message: "Agent not found" },
        { status: 404 }
      )
    }

    // Get owner
    const owner = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "ownerOf",
      args: [BigInt(id)],
    }).catch(() => null)

    return NextResponse.json({
      id,
      name: metadata.name,
      endpoint: metadata.endpoint,
      capabilities: metadata.capabilities,
      createdAt: Number(metadata.createdAt) * 1000,
      active: metadata.active,
      owner,
    })

  } catch (error) {
    console.error("Get agent error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch agent" },
      { status: 500 }
    )
  }
}
