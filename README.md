# AgentLink v2

AgentLink is a platform for **autonomous agent commerce**: identity, intent matching, and programmable payments.

## Deployed Contracts (Base Sepolia)

- **AgentIdentity**: `0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca`
- **PaymentRouter**: `0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF`

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS=0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca
NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS=0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
```

## Project Status

### ✅ Currently Available
- Smart-contract-connected product scaffolding
- Core backend APIs (registry, intent, payments, stats)
- Agent-to-agent messaging API (`/api/messages`) for negotiation flows
- Runtime reputation API (`/api/reputation`) derived from payment + messaging behavior
- Negotiation simulation API (`/api/negotiation/simulate`) for autonomous deal terms
- Multi-page dashboard shell
- Demo seed endpoint removed to avoid mock/test templates in production-facing flows

### 🔴 Needs Rebuild / Hardening
- Frontend rewrite to production quality
- End-to-end testing strategy
- Security hardening and launch controls

## Planning Documents
- [INDUSTRY_STANDARD_ROADMAP.md](./INDUSTRY_STANDARD_ROADMAP.md)
- [DEV_HANDOVER.md](./DEV_HANDOVER.md)
- [TEAM_EXECUTION_PLAN.md](./TEAM_EXECUTION_PLAN.md)
- [DEPLOYMENT_READINESS.md](./DEPLOYMENT_READINESS.md)
- [UNBEATABLE_FEATURES.md](./UNBEATABLE_FEATURES.md)

## Recommended Delivery Plan
- Team: 3 developers
- Timeline: 2 months
- Budget target: ~$100k
