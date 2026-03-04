# AgentLink API v1

Agent-First API for the AgentLink A2A Economy.

## Base URL

```
https://agentlink-dashboard-kkwpnmtgr-cookeikopfs-projects.vercel.app/api/v1
```

## Authentication

All API requests require an API key in the header:

```
X-API-Key: your-api-key-here
```

## Endpoints

### Payment Operations

#### Calculate Payment

```http
GET /api/v1/agents/pay?to={address}&amount={amount}
```

Response:
```json
{
  "feeBps": 100,
  "feePercent": 1.0,
  "minAmount": "0.01",
  "maxAmount": "1000000",
  "calculation": {
    "to": "0x...",
    "amount": "100.00",
    "feeBps": 100,
    "feePercent": 1.0,
    "feeAmount": "1.00",
    "receiverAmount": "99.00"
  }
}
```

#### Execute Payment (Simulation)

```http
POST /api/v1/agents/pay
Content-Type: application/json
X-API-Key: your-api-key

{
  "from": "0x...",
  "to": "0x...",
  "amount": "100.00",
  "memo": "Payment for services"
}
```

Response:
```json
{
  "success": true,
  "simulation": {
    "from": "0x...",
    "to": "0x...",
    "amount": "100.00",
    "fee": "1.00",
    "receiverAmount": "99.00",
    "memo": "Payment for services"
  },
  "message": "Payment simulation successful. Use your wallet to execute.",
  "executionRequired": true
}
```

### Agent Information

#### Get Agent

```http
GET /api/v1/agents/{id}
```

Response:
```json
{
  "id": "1",
  "name": "Payment Processor Alpha",
  "endpoint": "https://api.agent1.io/webhook",
  "capabilities": "payment,escrow",
  "createdAt": 1709990400000,
  "active": true,
  "owner": "0x..."
}
```

#### Get Agent Balance

```http
GET /api/v1/agents/{id}/balance
```

Response:
```json
{
  "agentId": "1",
  "owner": "0x...",
  "usdc": {
    "balance": "1000.50",
    "balanceRaw": "1000500000",
    "allowance": "500.00",
    "allowanceRaw": "500000000",
    "decimals": 6,
    "symbol": "USDC"
  }
}
```

## SDK Usage (Concept)

```typescript
import { AgentLinkClient } from "@agentlink/sdk"

const client = new AgentLinkClient({
  apiKey: process.env.AGENTLINK_API_KEY,
  baseUrl: "https://agentlink-dashboard-kkwpnmtgr-cookeikopfs-projects.vercel.app/api/v1"
})

// Check balance
const balance = await client.getBalance("1")
console.log(`USDC Balance: ${balance.usdc.balance}`)

// Calculate payment cost
const quote = await client.calculatePayment({
  to: "0x...",
  amount: "100.00"
})
console.log(`Fee: ${quote.feeAmount} USDC`)
```

## Error Handling

All errors follow this format:

```json
{
  "error": "ErrorType",
  "message": "Human readable error message"
}
```

Status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (Invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limits

- 100 requests per minute per API key

## Webhooks (Coming Soon)

Agents can register webhook URLs to receive real-time events:

- `payment.received` - When agent receives payment
- `agent.registered` - When new agent joins
- `agent.updated` - When agent metadata changes

## Contracts

- **AgentIdentity**: `0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca`
- **PaymentRouter**: `0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF`
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Network**: Base Sepolia (Chain ID: 84532)
