import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { baseSepolia } from "viem/chains"
import { AgentIdentityABI } from "@/lib/abis"

const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// POST /api/intent/match - Find agents that can fulfill an intent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      intent,           // "payment_processing", "escrow", "data_analysis"
      requirements,     // ["high_volume", "low_fee"]
      minReputation,    // 0-5
      maxFee            // max fee in basis points
    } = body

    if (!intent) {
      return NextResponse.json(
        { error: "Intent required" },
        { status: 400 }
      )
    }

    // Get all agents
    const totalSupply = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "totalSupply",
    })

    const matches = []
    
    for (let i = 1; i <= Number(totalSupply); i++) {
      try {
        const metadata = await publicClient.readContract({
          address: AGENT_IDENTITY_ADDRESS,
          abi: AgentIdentityABI,
          functionName: "getAgentMetadata",
          args: [BigInt(i)],
        })

        // Check if agent has the required capability
        const capabilities = metadata.capabilities.split(",").map((c: string) => c.trim().toLowerCase())
        
        if (!capabilities.includes(intent.toLowerCase())) {
          continue
        }

        // Check if active
        if (!metadata.active) {
          continue
        }

        const owner = await publicClient.readContract({
          address: AGENT_IDENTITY_ADDRESS,
          abi: AgentIdentityABI,
          functionName: "ownerOf",
          args: [BigInt(i)],
        })

        matches.push({
          id: i.toString(),
          name: metadata.name,
          endpoint: metadata.endpoint,
          capabilities,
          owner,
          confidence: calculateConfidence(capabilities, intent, requirements),
        })
      } catch (e) {
        // Skip
      }
    }

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence)

    return NextResponse.json({
      intent,
      matches,
      count: matches.length,
      message: matches.length > 0 
        ? `Found ${matches.length} agents that can handle "${intent}"`
        : `No agents found for intent "${intent}"`,
    })

  } catch (error) {
    console.error("Intent matching error:", error)
    return NextResponse.json(
      { error: "Failed to match intent" },
      { status: 500 }
    )
  }
}

function calculateConfidence(
  capabilities: string[], 
  intent: string, 
  requirements?: string[]
): number {
  let score = 0.5 // Base score for matching capability
  
  if (capabilities.includes(intent.toLowerCase())) {
    score += 0.3
  }
  
  if (requirements) {
    const matches = requirements.filter(r => 
      capabilities.some(c => c.includes(r.toLowerCase()))
    )
    score += (matches.length / requirements.length) * 0.2
  }
  
  return Math.min(score, 1.0)
}
