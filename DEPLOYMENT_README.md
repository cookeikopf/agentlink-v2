# AgentLink v2 - Testnet Deployment

## 🚀 Latest Deployment

**Date:** 2026-03-09  
**Network:** Base Sepolia (Testnet)

### Smart Contracts (Security Fixed)

| Contract | Address | Explorer |
|----------|---------|----------|
| **AgentReputation** | `0x7C56670BA983546A650e70E8D106631d69a56000` | [View on Basescan](https://sepolia.basescan.org/address/0x7C56670BA983546A650e70E8D106631d69a56000) |
| **PaymentRouter** | `0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59` | [View on Basescan](https://sepolia.basescan.org/address/0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59) |
| **USDC (Sepolia)** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [View on Basescan](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) |

### Security Fixes Applied

- ✅ **C-001:** Zero Address Validation
- ✅ **C-002:** Integer Overflow Protection
- ✅ **C-003:** Unchecked Return Value → emit ReputationUpdateFailed()
- ✅ **H-001:** Front-Running Protection (deadline parameter)
- ✅ **H-002:** Array Length Limits (MAX_BATCH_SIZE = 100)
- ✅ **H-003:** Complete Events with ReputationUpdateFailed
- ✅ **H-005:** Replay Protection (nonce mapping)

### Features

- ✅ A2A (Agent-to-Agent) Messaging System
- ✅ Webhook Support with Retry Logic
- ✅ Message Queue with Delivery Guarantees
- ✅ Payment Routing with 1% Platform Fee
- ✅ Reputation System with Reviews
- ✅ Session Keys for Secure Access

### API Endpoints

```
GET  /health                    → Health check
POST /api/v1/messages/send     → Send A2A message
GET  /api/v1/messages/:id      → Check message status
POST /api/v1/agents/register   → Register new agent
POST /api/v1/webhook/:agentId  → Webhook receiver
```

### Environment Variables

```bash
# Network
NETWORK=base-sepolia
RPC_URL=https://sepolia.base.org

# Contracts
AGENT_REPUTATION_CONTRACT=0x7C56670BA983546A650e70E8D106631d69a56000
PAYMENT_ROUTER_CONTRACT=0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59
USDC_CONTRACT=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Platform
PLATFORM_FEE_PERCENT=100  # 1%
```

### Testing

All core features tested and working:
- ✅ Agent registration
- ✅ USDC deposits/withdrawals
- ✅ Payment creation and execution
- ✅ Reputation updates
- ✅ Message sending and delivery

### Revenue Model

Platform Fee: 1% on all payments

Projections:
- 100 agents: ~$192,000/year
- 1,000 agents: ~$7.56M/year
- 10,000 agents: ~$220M/year

### Links

- **Dashboard:** https://agentlink-v2-five.vercel.app
- **GitHub:** https://github.com/cookeikopf/agentlink-v2
- **Testnet Explorer:** https://sepolia.basescan.org

### Next Steps

1. ✅ Testnet deployment complete
2. ⏳ Monitor for 1 week
3. 🎯 Mainnet deployment (coming soon)

---

**Built with ❤️ by AgentLink**
