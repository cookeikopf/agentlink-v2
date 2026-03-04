import { createPublicClient, http, formatUnits } from "viem"
import { baseSepolia } from "viem/chains"
import { AgentIdentityABI, PaymentRouterABI, USDCABI } from "./abis"

const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`
const PAYMENT_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS as `0x${string}`
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

export async function getAgentStats() {
  try {
    const totalSupply = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "totalSupply",
    })

    return {
      totalAgents: Number(totalSupply),
      activeAgents: Number(totalSupply),
    }
  } catch (error) {
    console.error("Error fetching agent stats:", error)
    return { totalAgents: 0, activeAgents: 0 }
  }
}

export async function getPaymentStats() {
  try {
    const stats = await publicClient.readContract({
      address: PAYMENT_ROUTER_ADDRESS,
      abi: PaymentRouterABI,
      functionName: "getStats",
    })

    return {
      totalVolume: Number(formatUnits(stats[0], 6)),
      totalFees: Number(formatUnits(stats[1], 6)),
      totalTransactions: Number(stats[2]),
    }
  } catch (error) {
    console.error("Error fetching payment stats:", error)
    return { totalVolume: 0, totalFees: 0, totalTransactions: 0 }
  }
}

export async function getAgentByOwner(ownerAddress: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "balanceOf",
      args: [ownerAddress],
    })

    if (balance === BigInt(0)) {
      return null
    }

    const tokenId = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "getTokenIdByOwner",
      args: [ownerAddress],
    })

    const metadata = await publicClient.readContract({
      address: AGENT_IDENTITY_ADDRESS,
      abi: AgentIdentityABI,
      functionName: "getAgentMetadata",
      args: [tokenId],
    })

    return {
      id: tokenId.toString(),
      name: metadata.name,
      endpoint: metadata.endpoint,
      capabilities: metadata.capabilities,
      createdAt: new Date(Number(metadata.createdAt) * 1000).toISOString(),
      active: metadata.active,
    }
  } catch (error) {
    console.error("Error fetching agent:", error)
    return null
  }
}

export async function getUSDCBalance(address: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDCABI,
      functionName: "balanceOf",
      args: [address],
    })

    return formatUnits(balance, 6)
  } catch (error) {
    console.error("Error fetching USDC balance:", error)
    return "0"
  }
}

export async function getFeeBps() {
  try {
    const feeBps = await publicClient.readContract({
      address: PAYMENT_ROUTER_ADDRESS,
      abi: PaymentRouterABI,
      functionName: "feeBps",
    })

    return Number(feeBps) / 100
  } catch (error) {
    console.error("Error fetching fee:", error)
    return 1.0
  }
}
