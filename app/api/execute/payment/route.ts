import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia } from "viem/chains"
import { PaymentRouterABI, USDCABI } from "@/lib/abis"
import { notifyPaymentReceived, notifyPaymentSent } from "@/lib/webhooks"
import { reputationStore } from "@/lib/reputation-store"

const PAYMENT_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS as `0x${string}`
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`

// Server wallet for autonomous execution
// In production, this comes from environment variable
const SERVER_PRIVATE_KEY = (process.env.SERVER_WALLET_PRIVATE_KEY || "0x" + "0".repeat(64)) as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
})

// Only create wallet client if we have a valid private key
const serverAccount = SERVER_PRIVATE_KEY.length === 66 ? privateKeyToAccount(SERVER_PRIVATE_KEY) : null

const walletClient = serverAccount ? createWalletClient({
  account: serverAccount,
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
}) : null

// POST /api/execute/payment - Execute real payment on blockchain
export async function POST(req: NextRequest) {
  try {
    // Check if server wallet is configured
    if (!walletClient || !serverAccount) {
      return NextResponse.json({
        status: "error",
        message: "Server wallet not configured",
        details: "Set SERVER_WALLET_PRIVATE_KEY environment variable to enable autonomous payments",
        simulation: true,
      }, { status: 503 })
    }

    const body = await req.json()
    const {
      from,           // Source agent address (must approve USDC)
      to,             // Target agent address
      amount,         // Amount in USDC
      memo = "",      // Payment memo
      signature,      // Authorization signature (optional for now)
    } = body

    // Validate inputs
    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: from, to, amount" },
        { status: 400 }
      )
    }

    // Validate addresses
    if (!from.startsWith("0x") || !to.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      )
    }

    // Convert amount to BigInt (USDC has 6 decimals)
    const amountBigInt = parseUnits(amount.toString(), 6)

    // Check if 'from' has approved the PaymentRouter
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDCABI,
      functionName: "allowance",
      args: [from as `0x${string}`, PAYMENT_ROUTER_ADDRESS],
    })

    if (allowance < amountBigInt) {
      return NextResponse.json({
        status: "approval_required",
        message: "USDC approval required",
        details: `Agent ${from} must approve PaymentRouter to spend USDC`,
        allowance: formatUnits(allowance, 6),
        required: amount.toString(),
        approveData: {
          token: USDC_ADDRESS,
          spender: PAYMENT_ROUTER_ADDRESS,
          amount: amountBigInt.toString(),
        },
      }, { status: 400 })
    }

    // Check if 'from' has sufficient balance
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDCABI,
      functionName: "balanceOf",
      args: [from as `0x${string}`],
    })

    if (balance < amountBigInt) {
      return NextResponse.json({
        status: "insufficient_funds",
        message: "Insufficient USDC balance",
        balance: formatUnits(balance, 6),
        required: amount.toString(),
      }, { status: 400 })
    }

    // Execute payment on blockchain
    // NOTE: In a real implementation, we need proper authorization
    // For demo, we'll simulate the transaction
    
    const txHash = await walletClient.writeContract({
      address: PAYMENT_ROUTER_ADDRESS,
      abi: PaymentRouterABI,
      functionName: "pay",
      args: [to as `0x${string}`, amountBigInt, memo],
    }).catch((error) => {
      console.error("Transaction failed:", error)
      return null
    })

    if (!txHash) {
      reputationStore.recordPayment(from, to, false)
      return NextResponse.json({
        status: "error",
        message: "Transaction failed",
        details: "Could not execute payment on blockchain",
      }, { status: 500 })
    }

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    if (receipt.status !== "success") {
      reputationStore.recordPayment(from, to, false)
      return NextResponse.json({
        status: "failed",
        message: "Transaction reverted",
        txHash,
        receipt,
      }, { status: 500 })
    }

    reputationStore.recordPayment(from, to, true)

    // Send webhooks to notify agents
    notifyPaymentSent(from, {
      to,
      amount: amount.toString(),
      memo,
      txHash,
    })

    notifyPaymentReceived(to, {
      from,
      amount: amount.toString(),
      memo,
      txHash,
    })

    return NextResponse.json({
      status: "success",
      message: "Payment executed successfully",
      txHash,
      from,
      to,
      amount: amount.toString(),
      memo,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
    })

  } catch (error) {
    console.error("Payment execution error:", error)
    return NextResponse.json(
      { 
        status: "error",
        message: "Failed to execute payment",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET /api/execute/payment - Get execution status/info
export async function GET(req: NextRequest) {
  return NextResponse.json({
    endpoint: "/api/execute/payment",
    method: "POST",
    description: "Execute autonomous payment on blockchain",
    requires: ["from", "to", "amount"],
    optional: ["memo", "signature"],
    serverWalletConfigured: !!walletClient,
    serverWalletAddress: serverAccount?.address || null,
  })
}
