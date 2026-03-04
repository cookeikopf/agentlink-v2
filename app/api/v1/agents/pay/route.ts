import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, formatUnits, parseUnits, createWalletClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia } from "viem/chains"
import { AgentIdentityABI, PaymentRouterABI, USDCABI } from "@/lib/abis"

const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`
const PAYMENT_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS as `0x${string}`
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// API Key validation (simple for now)
function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key")
  // In production, validate against database
  return !!apiKey
}

// POST /api/v1/agents/pay - Execute a payment
export async function POST(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing API key" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { from, to, amount, memo = "" } = body

    // Validate required fields
    if (!from || !to || !amount) {
      return NextResponse.json(
        { 
          error: "Bad Request", 
          message: "Missing required fields: from, to, amount" 
        },
        { status: 400 }
      )
    }

    // Validate addresses
    if (!from.startsWith("0x") || !to.startsWith("0x")) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid address format" },
        { status: 400 }
      )
    }

    // Note: Actual payment execution requires private key
    // This endpoint returns what WOULD happen
    // Real execution needs a server-side wallet or user signature

    // Calculate fee
    const feeBps = await publicClient.readContract({
      address: PAYMENT_ROUTER_ADDRESS,
      abi: PaymentRouterABI,
      functionName: "feeBps",
    })

    const amountBigInt = parseUnits(amount.toString(), 6) // USDC has 6 decimals
    const fee = (amountBigInt * feeBps) / BigInt(10000)
    const receiverAmount = amountBigInt - fee

    return NextResponse.json({
      success: true,
      simulation: {
        from,
        to,
        amount: amount.toString(),
        fee: formatUnits(fee, 6),
        receiverAmount: formatUnits(receiverAmount, 6),
        memo,
      },
      message: "Payment simulation successful. Use your wallet to execute.",
      executionRequired: true,
    })

  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process payment" },
      { status: 500 }
    )
  }
}

// GET /api/v1/agents/pay - Get payment info/fee structure
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const to = searchParams.get("to")
    const amount = searchParams.get("amount")

    // Get fee structure
    const feeBps = await publicClient.readContract({
      address: PAYMENT_ROUTER_ADDRESS,
      abi: PaymentRouterABI,
      functionName: "feeBps",
    })

    // Calculate if amount provided
    let calculation = null
    if (to && amount) {
      const amountBigInt = parseUnits(amount, 6)
      const fee = (amountBigInt * feeBps) / BigInt(10000)
      const receiverAmount = amountBigInt - fee
      
      calculation = {
        to,
        amount,
        feeBps: Number(feeBps),
        feePercent: Number(feeBps) / 100,
        feeAmount: formatUnits(fee, 6),
        receiverAmount: formatUnits(receiverAmount, 6),
      }
    }

    return NextResponse.json({
      feeBps: Number(feeBps),
      feePercent: Number(feeBps) / 100,
      minAmount: "0.01",
      maxAmount: "1000000",
      calculation,
    })

  } catch (error) {
    console.error("Fee info error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
