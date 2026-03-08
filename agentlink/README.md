# AgentLink - Agent-to-Agent Payment Network

> The standard for autonomous agent payments on Base

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry (for contracts)
- PostgreSQL (for backend)
- MetaMask or similar wallet

### Installation

```bash
# Clone repository
git clone https://github.com/cookeikopf/agentlink-v2.git
cd agentlink-v2

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values
```

### Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Run tests
forge test

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --private-key $PRIVATE_KEY --broadcast
```

### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
agentlink/
├── contracts/          # Solidity smart contracts
│   ├── src/           # Contract source code
│   ├── test/          # Foundry tests
│   └── script/        # Deployment scripts
│
├── backend/           # Node.js API server
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   └── tests/        # Test files
│
├── frontend/          # Next.js dashboard
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   └── lib/          # Utilities
│
├── sdk/              # JavaScript SDK
│
└── docs/             # Documentation
```

## 🔗 Deployed Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| AgentReputation | `0x7C56670BA983546A650e70E8D106631d69a56000` |
| PaymentRouter | `0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

## 📚 Documentation

- [Industry Standard Roadmap](docs/INDUSTRY_STANDARD_ROADMAP.md) - Full production checklist
- [Deployment Report](docs/DEPLOYMENT_SUCCESS.md) - Testnet deployment details
- [Revenue Model](docs/REVENUE_REPORT.md) - Economic analysis
- [Security Audit](docs/SECURITY_AUDIT_PROFESSIONAL.md) - Audit findings

## 🔧 Environment Variables

Create `.env` file in each directory:

### Backend
```
DATABASE_URL="postgresql://..."
RPC_URL="https://sepolia.base.org"
AGENT_REPUTATION_CONTRACT="0x7C56670BA983546A650e70E8D106631d69a56000"
PAYMENT_ROUTER_CONTRACT="0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59"
```

### Frontend
```
NEXT_PUBLIC_RPC_URL="https://sepolia.base.org"
NEXT_PUBLIC_AGENT_REPUTATION_CONTRACT="0x7C56670BA983546A650e70E8D106631d69a56000"
NEXT_PUBLIC_PAYMENT_ROUTER_CONTRACT="0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run contract tests
cd contracts && forge test

# Run backend tests
cd backend && npm test
```

## 📝 API Endpoints

### REST API
```
GET    /api/v1/agents          # List all agents
POST   /api/v1/agents          # Register new agent
GET    /api/v1/agents/:id      # Get agent details
POST   /api/v1/payments        # Create payment
GET    /api/v1/payments/:id    # Get payment status
POST   /api/v1/messages        # Send A2A message
```

### WebSocket
```
ws://api.agentlink.io/realtime  # Real-time updates
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🔗 Links

- **Dashboard:** https://agentlink-v2-five.vercel.app
- **Testnet Explorer:** https://sepolia.basescan.org
- **Documentation:** https://docs.agentlink.io

## ⚠️ Status

**Current:** MVP (60% complete)  
**Target:** Industry Standard (see Roadmap)

The platform is functional but requires additional development for production use.

---

Built with ❤️ by the AgentLink team
