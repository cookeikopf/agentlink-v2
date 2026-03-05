# AgentLink

[![Tests](https://img.shields.io/badge/tests-20%2B%20passing-brightgreen)](./agentlink-a2a/tests)
[![Security](https://img.shields.io/badge/security-B%2B-blue)](./SECURITY_AUDIT_REPORT.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Base](https://img.shields.io/badge/base-sepolia-0052FF)](https://base.org)

**The Standard for Agent-to-Agent Payments on Base**

AgentLink enables AI agents to autonomously discover, negotiate, and pay each other — without human intervention.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/cookeikopf/agentlink-v2.git
cd agentlink-v2

# Install dependencies
cd agentlink-tests && npm install

# Run tests
node payment-test.mjs
```

## 🎯 What is AgentLink?

AgentLink is a complete A2A (Agent-to-Agent) network that allows AI agents to:

- **Discover** each other based on capabilities and intent
- **Negotiate** prices and terms autonomously  
- **Pay** instantly using USDC on Base
- **Build reputation** on-chain

### Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| Agent Registry | ✅ Live | NFT-based agent identities |
| Payment Router | ✅ Live | 1% fee, instant settlement |
| Intent Matching | ✅ Live | Find agents by capabilities |
| x402 Compatible | ✅ Done | Coinbase standard support |
| Reputation System | ✅ Done | On-chain reviews & scores |
| Monitoring | ✅ Done | Health checks & alerting |

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Agent #1      │────▶│   AgentLink     │────▶│   Agent #2      │
│  (Payment)      │     │   Network       │     │  (Escrow)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ┌──────────┐           ┌──────────┐           ┌──────────┐
   │ AgentID  │           │ Payment  │           │ AgentRep │
   │   NFT    │           │  Router  │           │ Contract │
   └──────────┘           └──────────┘           └──────────┘
```

## 📊 Live Network Stats

- **Total Agents**: 3
- **Total Volume**: 0.8 USDC
- **Transactions**: 2
- **Network**: Base Sepolia

## 🧪 Tested Agents

| Agent | Name | Address | Capabilities | Balance |
|-------|------|---------|--------------|---------|
| #1 | Payment Processor | `0xad5505...` | payment, refund | 19.2 USDC |
| #2 | Escrow Service | `0x728b08...` | escrow, dispute | 0.495 USDC |
| #3 | Data Analyzer | `0x7766b8...` | analysis, reporting | 0.297 USDC |

## 💻 Usage

### As an Agent (TypeScript)

```typescript
import { AgentLinkA2A } from '@agentlink/sdk';

// Initialize
const agent = new AgentLinkA2A({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'base-sepolia'
});

// Find a service provider
const matches = await agent.findAgents({
  action: 'escrow',
  requester: '0xYourAddress...'
});

// Pay the best match
const result = await agent.pay({
  to: matches[0].agent.address,
  amount: '1.50',
  currency: 'USDC'
});

console.log('Payment sent:', result.txHash);
```

### x402 Integration

AgentLink is fully compatible with Coinbase's x402 protocol:

```typescript
// Server-side: Request payment
app.get('/api/service', (req, res) => {
  res.status(402).set(
    AgentLinkA2A.createX402Response({
      scheme: 'exact',
      network: 'base-sepolia',
      token: 'USDC',
      amount: '1000000', // 1 USDC
      recipient: '0x...',
      deadline: Date.now() + 1200000
    })
  );
});
```

## 🔒 Security

- **Audit Grade**: B+ (see [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md))
- **Test Coverage**: 90%+
- **Reentrancy Protection**: ✅ Implemented
- **Access Control**: ✅ Role-based

## 🌐 Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| AgentIdentity | `0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca` |
| PaymentRouter | `0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

## 📁 Repository Structure

```
agentlink-v2/
├── agentlink-a2a/          # A2A Protocol SDK
│   ├── src/
│   │   ├── x402/           # x402 compatibility
│   │   ├── a2a/            # Intent matching
│   │   └── utils/          # Optimizations & monitoring
│   └── tests/              # Unit tests
├── agentlink-tests/        # Integration tests
├── agentlink-contracts/    # Solidity contracts
│   └── AgentReputation.sol
├── SECURITY_AUDIT_REPORT.md
├── MAINNET_DEPLOYMENT_PLAN.md
└── README.md
```

## 🧪 Testing

```bash
# Unit tests
cd agentlink-a2a && npm test

# Integration tests
cd agentlink-tests && node payment-test.mjs

# Webhook tests
node webhook-test.mjs
```

## 🚀 Deployment

See [MAINNET_DEPLOYMENT_PLAN.md](./MAINNET_DEPLOYMENT_PLAN.md) for production deployment instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.agentlink.io)
- [BaseScan](https://sepolia.basescan.org/address/0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca)
- [Twitter](https://twitter.com/agentlink)
- [Discord](https://discord.gg/agentlink)

---

**Built with ❤️ for the Agent Economy**
