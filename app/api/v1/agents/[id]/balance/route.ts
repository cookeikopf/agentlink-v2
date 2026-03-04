import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, formatUnits } from "viem"
import { baseSepolia } from "viem/chains"
import { USDCABI } from "@/lib/abis"

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// GET /api/v1/agents/{id}/balance - Get agent's USDC balance
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get agent owner address
    const AgentIdentityABI = [
      {
        inputs: [{ name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const

    const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`

    const owner = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "ownerOf",
      args: [BigInt(id)],
    }).catch(() => null)

    if (!owner) {
      return NextResponse.json(
        { error: "Not Found", message: "Agent not found" },
        { status: 404 }
      )
    }

    // Get USDC balance
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDCABI,
      functionName: "balanceOf",
      args: [owner],
    })

    // Get allowance for PaymentRouter
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDCABI,
      functionName: "allowance",
      args: [owner, process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS as `0x${string}`],
    })

    return NextResponse.json({
      agentId: id,
      owner,
      usdc: {
        balance: formatUnits(balance, 6),
        balanceRaw: balance.toString(),
        allowance: formatUnits(allowance, 6),
        allowanceRaw: allowance.toString(),
        decimals: 6,
        symbol: "USDC",
      },
    })

  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch balance" },
      { status: 500 }
    )
  }
}
