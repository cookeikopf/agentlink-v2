import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, createWalletClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia } from "viem/chains"
import { AgentIdentityABI } from "@/lib/abis"

const AGENT_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`

// This would need a server-side private key in production
// For demo purposes, this is a test endpoint

// POST /api/seed/agents - Create test agents (demo only)
export async function POST(req: NextRequest) {
  try {
    // In production, this would use a server wallet
    // For now, return instructions
    
    const testAgents = [
      {
        name: "Payment Processor Alpha",
        endpoint: "https://payment-agent.example.com",
        capabilities: "payment_processing,refund_handling,currency_exchange",
        uri: "https://agent.link/metadata/1",
      },
      {
        name: "Escrow Service Beta", 
        endpoint: "https://escrow-agent.example.com",
        capabilities: "escrow,dispute_resolution,multi_sig",
        uri: "https://agent.link/metadata/2",
      },
      {
        name: "Data Analyzer Gamma",
        endpoint: "https://data-agent.example.com", 
        capabilities: "data_analysis,reporting,insights",
        uri: "https://agent.link/metadata/3",
      },
      {
        name: "Notification Service",
        endpoint: "https://notify-agent.example.com",
        capabilities: "notifications,alerts,webhooks",
        uri: "https://agent.link/metadata/4",
      },
    ]

    return NextResponse.json({
      message: "To create test agents, use the AgentIdentity contract directly",
      contract: AGENT_IDENTITY_ADDRESS,
      abi: ["function mintSelf(string name, string endpoint, string capabilities, string uri) payable returns (uint256)"],
      testAgents,
      instructions: {
        step1: "Connect wallet to Base Sepolia",
        step2: "Call mintSelf() with agent details", 
        step3: "Pay small mint fee (0.001 ETH)",
        frontend: "Or use the dashboard 'Register Agent' feature (coming soon)",
      },
      demoMode: true,
    })

  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to create test agents" },
      { status: 500 }
    )
  }
}

// GET /api/seed/agents - Get test agent templates
export async function GET() {
  return NextResponse.json({
    templates: [
      {
        name: "Payment Processor",
        capabilities: "payment_processing,refund_handling",
        description: "Processes payments and handles refunds",
      },
      {
        name: "Escrow Service",
        capabilities: "escrow,dispute_resolution",
        description: "Holds funds securely until conditions are met",
      },
      {
        name: "Data Analyzer",
        capabilities: "data_analysis,reporting",
        description: "Analyzes data and generates reports",
      },
    ],
    mintFunction: "mintSelf",
    contract: AGENT_IDENTITY_ADDRESS,
  })
}
