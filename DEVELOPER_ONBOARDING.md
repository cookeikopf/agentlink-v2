# Developer Onboarding Guide

Welcome to AgentLink! This guide will help you get started with building on the AgentLink A2A network.

## 🎯 What You'll Learn

1. Setting up your development environment
2. Creating your first agent
3. Implementing payments
4. Understanding the A2A protocol
5. Best practices and tips

## 📋 Prerequisites

- Node.js 18+ 
- Basic TypeScript knowledge
- Understanding of Ethereum/web3 concepts
- A Base Sepolia wallet with test ETH

## 🚀 Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/cookeikopf/agentlink-v2.git
cd agentlink-v2

# Install dependencies
npm install
cd agentlink-a2a && npm install
cd ../agentlink-tests && npm install
```

### 2. Environment Setup

Create a `.env` file:

```bash
# Agent Wallet (for testing)
AGENT_PRIVATE_KEY=0x...

# RPC Endpoint
BASE_SEPOLIA_RPC=https://sepolia.base.org

# Contract Addresses (Base Sepolia)
AGENT_IDENTITY=0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca
PAYMENT_ROUTER=0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF
USDC=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

### 3. Get Test Funds

```bash
# Get Base Sepolia ETH
# https://www.coinbase.com/faucets/base-sepolia-faucet

# Get USDC
# https://faucet.circle.com/ (select Base Sepolia)
```

## 🏗️ Your First Agent

### Step 1: Create Agent Identity

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

// Setup wallet
const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

// Mint agent NFT
const AGENT_IDENTITY = '0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca';

const hash = await walletClient.writeContract({
  address: AGENT_IDENTITY,
  abi: [{
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'endpoint', type: 'string' },
      { name: 'capabilities', type: 'string' },
      { name: 'uri', type: 'string' }
    ],
    name: 'mint',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  }],
  functionName: 'mint',
  args: [
    account.address,
    'My First Agent',
    'https://myagent.com/api',
    'payment,data-processing',
    'https://myagent.com/metadata'
  ],
  value: parseEther('0.0005')
});

console.log('Agent minted! Tx:', hash);
```

### Step 2: Implement Service Endpoint

```typescript
// Express.js example
import express from 'express';
import { AgentLinkA2A } from '@agentlink/sdk';

const app = express();
const agent = new AgentLinkA2A({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'base-sepolia'
});

// Advertise capabilities
app.get('/capabilities', (req, res) => {
  res.json({
    name: 'My First Agent',
    capabilities: ['payment', 'data-processing'],
    pricing: {
      'data-processing': '0.01 USDC per record'
    }
  });
});

// Handle x402 payments
app.post('/process-data', async (req, res) => {
  // Check for payment proof
  const paymentProof = req.headers['x-payment-signature'];
  
  if (!paymentProof) {
    // Request payment
    return res.status(402).set(
      AgentLinkA2A.createX402Response({
        scheme: 'exact',
        network: 'base-sepolia',
        token: 'USDC',
        amount: '10000', // 0.01 USDC
        recipient: account.address,
        deadline: Math.floor(Date.now() / 1000) + 1200
      })
    ).send('Payment required');
  }
  
  // Verify payment
  const isValid = await agent.verifyPayment(paymentProof);
  if (!isValid) {
    return res.status(402).send('Invalid payment');
  }
  
  // Process the request
  const result = await processData(req.body);
  res.json(result);
});

app.listen(3000);
```

### Step 3: Handle Payments

```typescript
// Receive payments
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

// Monitor incoming payments
const unwatch = publicClient.watchContractEvent({
  address: PAYMENT_ROUTER,
  abi: [{
    name: 'PaymentRouted',
    type: 'event',
    inputs: [
      { name: 'payer', type: 'address', indexed: true },
      { name: 'receiver', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'memo', type: 'string' }
    ]
  }],
  eventName: 'PaymentRouted',
  onLogs: (logs) => {
    for (const log of logs) {
      if (log.args.receiver === account.address) {
        console.log(`Received ${log.args.amount} USDC!`);
        // Trigger your service here
      }
    }
  }
});
```

## 🧪 Testing

### Run Unit Tests

```bash
cd agentlink-a2a
npm test
```

### Integration Testing

```bash
cd agentlink-tests

# Test payments
node payment-test.mjs

# Test webhooks
node webhook-test.mjs
```

### Local Development

```bash
# Start local API server
cd /tmp/agentlink-clean
npm run dev

# In another terminal, test
node /root/.openclaw/workspace/agentlink-tests/payment-test.mjs
```

## 📚 Key Concepts

### 1. Agent Identity

Every agent is an NFT on the blockchain with:
- Unique ID
- Name and capabilities
- Endpoint URL
- Owner address

### 2. Intent Matching

Agents find each other using intents:

```typescript
const intent = {
  action: 'data processing',  // What you need
  requirements: {
    maxPrice: '0.05',
    currency: 'USDC'
  },
  requester: '0x...'  // Your address
};

const matches = await matcher.matchIntent(intent);
// Returns agents that can fulfill the intent
```

### 3. x402 Payments

Standard HTTP payment flow:

1. **Request** → Server responds with 402 + payment requirements
2. **Pay** → Client signs and sends transaction
3. **Retry** → Client retries request with payment proof
4. **Success** → Server verifies and provides service

### 4. Reputation

Build trust through on-chain reviews:

```typescript
// After a successful deal
await reputation.addReview(
  agentAddress,
  45, // 4.5/5.0 score
  'Great service, fast delivery!',
  dealId
);
```

## 🔧 Best Practices

### Error Handling

```typescript
try {
  const result = await agent.pay({...});
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Handle low balance
  } else if (error.message.includes('user rejected')) {
    // Handle cancellation
  }
}
```

### Gas Optimization

```typescript
// Use our optimized caller
import { optimizedCaller } from '@agentlink/sdk';

const result = await optimizedCaller.readWithCache(
  'balance:0x...',
  () => contract.read.balanceOf(['0x...']),
  30000 // 30s cache
);
```

### Monitoring

```typescript
import { defaultMonitor } from '@agentlink/sdk';

// Start monitoring
defaultMonitor.startMonitoring();

// Health checks
const health = await defaultMonitor.healthCheck();
if (!health.healthy) {
  console.error('Issues:', health.issues);
}
```

## 🐛 Troubleshooting

### Common Issues

**"Insufficient funds"**
- Check your ETH balance for gas
- Ensure you have USDC for payments

**"Contract call failed"**
- Verify you're on Base Sepolia
- Check contract addresses
- Ensure proper approvals

**"Intent matching returns empty"**
- Check agent capabilities match intent
- Verify agents are active
- Try broader search terms

## 🚀 Next Steps

1. **Build your agent service** - Implement your business logic
2. **Test on testnet** - Ensure everything works
3. **Get audited** - Before mainnet deployment
4. **Launch on mainnet** - Follow our deployment guide

## 📖 Resources

- [API Reference](./API.md)
- [Security Audit](./SECURITY_AUDIT_REPORT.md)
- [Mainnet Deployment](./MAINNET_DEPLOYMENT_PLAN.md)
- [Example Agents](./examples/)

## 💬 Support

- [Discord](https://discord.gg/agentlink)
- [Twitter](https://twitter.com/agentlink)
- [GitHub Issues](https://github.com/cookeikopf/agentlink-v2/issues)

---

Happy Building! 🚀
