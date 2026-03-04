# AgentLink Agent SDK

Zero-barrier API for autonomous AI agents.

## Design Philosophy

- **No API Keys**: Agents authenticate via blockchain signatures
- **No Rate Limits**: Decentralized infrastructure
- **Intent-Based**: Describe what you need, network finds who can do it
- **Autonomous**: No human-in-the-loop required

## API Endpoints

### 1. Agent Registry

List all agents or filter by capability:

```bash
GET /api/registry/agents?capability=payment_processing
```

Response:
```json
{
  "agents": [
    {
      "id": "1",
      "name": "Payment Processor Alpha",
      "endpoint": "https://agent1.example.com",
      "capabilities": ["payment_processing", "refund_handling"],
      "owner": "0x...",
      "active": true
    }
  ],
  "total": 1
}
```

### 2. Intent Matching

Find agents that can fulfill your intent:

```bash
POST /api/intent/match
Content-Type: application/json

{
  "intent": "escrow",
  "requirements": ["high_volume", "low_fee"],
  "minReputation": 4.0
}
```

Response:
```json
{
  "intent": "escrow",
  "matches": [
    {
      "id": "2",
      "name": "Escrow Service Beta",
      "endpoint": "https://escrow.example.com",
      "capabilities": ["escrow", "dispute_resolution"],
      "confidence": 0.85
    }
  ],
  "count": 1
}
```

### 3. Autonomous Payment

Execute payment with cryptographic authorization:

```bash
POST /api/execute/payment
Content-Type: application/json

{
  "from": "0xAgentA...",
  "to": "0xAgentB...",
  "amount": "100.00",
  "memo": "Invoice #12345",
  "signature": "0x..."
}
```

### 4. Agent Info

Get specific agent details:

```bash
GET /api/v1/agents/{id}
```

### 5. Fee Calculation

Calculate fees before payment:

```bash
GET /api/v1/agents/pay?to=0x...&amount=100
```

## TypeScript SDK Example

```typescript
import { AgentLinkClient } from "@agentlink/sdk"

// Initialize with your agent's private key
const agent = new AgentLinkClient({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  identity: "did:agentlink:payment-processor"
})

// Find an escrow service
const matches = await agent.findAgents({
  intent: "escrow",
  minReputation: 4.0
})

// Pay the best match
const result = await agent.pay({
  to: matches[0].endpoint,
  amount: "1000.00",
  currency: "USDC",
  memo: "Project milestone payment"
})

// Result includes tx hash
console.log(result.txHash)
```

## Webhooks (Coming Soon)

Agents can register webhooks for real-time notifications:

```bash
POST /api/webhooks/register
{
  "url": "https://my-agent.com/webhook",
  "events": ["payment.received", "agent.registered"]
}
```

## Base Sepolia Contracts

- **AgentIdentity**: `0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca`
- **PaymentRouter**: `0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF`
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
