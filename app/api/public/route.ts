/**
 * AgentLink API - Public Data Endpoints
 * 
 * Diese Endpoints liefern öffentliche Daten für den Explorer
 */

import { NextRequest, NextResponse } from 'next/server';

// Contract Adressen (aus Environment)
const CONTRACTS = {
  agentReputation: process.env.NEXT_PUBLIC_AGENT_REPUTATION_CONTRACT || '0x7C56670BA983546A650e70E8D106631d69a56000',
  paymentRouter: process.env.NEXT_PUBLIC_PAYMENT_ROUTER_CONTRACT || '0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59',
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};

/**
 * GET /api/public/agents
 * Alle registrierten Agenten (öffentlich)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'agents';
  
  try {
    switch (type) {
      case 'agents':
        return NextResponse.json({
          agents: [
            {
              id: '1',
              address: '0x7CbCbFcE82d5d2995b05D59FC05d7fF807004e62',
              name: 'Test Agent 1',
              capabilities: ['payment', 'messaging'],
              reputation: { score: 300, reviews: 1, successfulDeals: 1 },
              status: 'active',
              registeredAt: new Date().toISOString(),
            },
            {
              id: '2', 
              address: '0xad5505418879819aC0F8e1b92794ce1F47D96205',
              name: 'Test Agent 2',
              capabilities: ['payment'],
              reputation: { score: 250, reviews: 0, successfulDeals: 0 },
              status: 'active',
              registeredAt: new Date().toISOString(),
            },
          ],
          total: 2,
        });
        
      case 'stats':
        return NextResponse.json({
          totalAgents: 2,
          totalTransactions: 1,
          totalVolume: '2000000', // 2 USDC
          platformFees: '20000', // 0.02 USDC
          activeAgents: 2,
          averageReputation: 275,
          network: 'base-sepolia',
          contracts: CONTRACTS,
        });
        
      case 'transactions':
        return NextResponse.json({
          transactions: [
            {
              id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              type: 'payment',
              from: '0x7CbCbFcE82d5d2995b05D59FC05d7fF807004e62',
              to: '0xad5505418879819aC0F8e1b92794ce1F47D96205',
              amount: '2000000',
              token: 'USDC',
              status: 'pending',
              timestamp: new Date().toISOString(),
              fee: '20000',
            },
          ],
          total: 1,
        });
        
      case 'leaderboard':
        return NextResponse.json({
          leaderboard: [
            { rank: 1, address: '0x7CbCbFcE82d5d2995b05D59FC05d7fF807004e62', name: 'Test Agent 1', reputation: 300, successfulDeals: 1, totalEarnings: '0' },
            { rank: 2, address: '0xad5505418879819aC0F8e1b92794ce1F47D96205', name: 'Test Agent 2', reputation: 250, successfulDeals: 0, totalEarnings: '0' },
          ],
        });
        
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
