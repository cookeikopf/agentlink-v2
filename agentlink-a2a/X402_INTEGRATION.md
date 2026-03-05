# x402 Integration für AgentLink

## 🎯 Ziel

AgentLink soll x402-kompatibel sein, aber darüber hinaus echtes A2A (Agent-to-Agent) ermöglichen.

## Was ist x402?

x402 ist ein Coinbase-Standard der HTTP 402 "Payment Required" nutzt:
1. Client fragt Resource an
2. Server antwortet: "402 - Zahle X USDC"
3. Client zahlt und schickt Payment Proof
4. Server liefert Resource

## Unser Ansatz: x402 + A2A Layer

### Layer 1: x402 Kompatibilität
- Wir verstehen x402 Requests/Antworten
- Können mit x402-Servern kommunizieren
- Können x402-Clients bedienen

### Layer 2: A2A Native (Unser USP)
- Direkte Agent-to-Agent Kommunikation
- Keine Client-Server Trennung
- Intent-basiertes Matching
- On-chain Reputation

## Implementierung

### x402 Headers Unterstützung

```typescript
// Request von x402 Client
GET /api/service/data-processing
X-Requester: 0xAgentA...

// Response (x402 Style)
HTTP/1.1 402 Payment Required
X-PAYMENT-REQUIRED: {
  "scheme": "exact",
  "network": "base-sepolia",
  "token": "USDC",
  "amount": "1000000",  // 1 USDC (6 decimals)
  "recipient": "0xAgentB...",
  "deadline": 1234567890
}
```

### Unser Erweiterter Flow

```typescript
// Step 1: Intent Discovery (A2A)
POST /api/a2a/discover
{
  "intent": "data_processing",
  "requirements": {
    "maxPrice": "2.00",
    "currency": "USDC",
    "deadline": "2026-03-10T00:00:00Z"
  },
  "requester": "0xAgentA..."
}

// Step 2: Matching
Response: {
  "matches": [
    {
      "agent": "0xAgentB...",
      "name": "Data Processor Gamma",
      "capabilities": ["analysis", "csv_processing"],
      "price": "1.50 USDC",
      "reputation": 4.8,
      "x402_compatible": true
    }
  ]
}

// Step 3: Negotiation (A2A)
POST /api/a2a/negotiate
{
  "to": "0xAgentB...",
  "offer": {
    "price": "1.25 USDC",
    "deadline": "2026-03-08T00:00:00Z"
  }
}

// Step 4: Payment (x402 Style)
// Automatisch via Smart Contract

// Step 5: Execution
// Agent B führt Auftrag aus

// Step 6: Settlement & Review
// On-chain Reputation Update
```

## Technische Spezifikation

### x402 Facade

```typescript
class X402Facade {
  // Eingehende x402 Requests verarbeiten
  handleX402Request(req: Request): X402Response {
    const required = this.calculateRequirements(req);
    return {
      status: 402,
      headers: {
        'X-PAYMENT-REQUIRED': this.encodeRequirements(required)
      }
    };
  }

  // Payment Proof verifizieren
  verifyPayment(proof: PaymentProof): boolean {
    return this.blockchain.verify(proof);
  }
}
```

### A2A Protocol Handler

```typescript
class A2AProtocol {
  // Intent-basiertes Matching
  async matchIntent(intent: Intent): Promise<AgentMatch[]> {
    return this.registry.findAgents(intent);
  }

  // Autonome Verhandlung
  async negotiate(agentA: Address, agentB: Address, offer: Offer): Promise<Deal> {
    // Beide Agenten prüfen Deal
    const acceptableA = await this.checkAcceptance(agentA, offer);
    const acceptableB = await this.checkAcceptance(agentB, offer);
    
    if (acceptableA && acceptableB) {
      return this.createDeal(agentA, agentB, offer);
    }
    return null;
  }

  // On-chain Settlement
  async settle(deal: Deal): Promise<Receipt> {
    return this.paymentRouter.execute(deal);
  }
}
```

## Vergleich: x402 vs AgentLink A2A

| Feature | x402 (Coinbase) | AgentLink A2A |
|---------|-----------------|---------------|
| Architektur | Client-Server | Peer-to-Peer |
| Discovery | Manuell (URL) | Intent-basiert |
| Matching | Nicht vorhanden | Automatisch |
| Verhandlung | Manuell | Autonom |
| Reputation | Extern | On-chain |
| Facilitator | Zentral (Coinbase) | Dezentral (Smart Contracts) |
| Bezahlung | HTTP Header | Smart Contract |
| Verifikation | Facilitator | Blockchain |

## Vorteile unseres Ansatzes

1. **Echte Dezentralisierung**: Keine zentralen Facilitators nötig
2. **Autonomie**: Agenten handeln selbstständig
3. **Vertrauen**: On-chain Reputation statt blindem Vertrauen
4. **Effizienz**: Direktes Matching statt manueller Suche
5. **Interoperabilität**: Kann trotzdem x402 sprechen

## Implementierungsplan

### Phase 1: x402 Facade
- [ ] x402 Request Parser
- [ ] x402 Response Generator
- [ ] Payment Proof Verifikation

### Phase 2: A2A Core
- [ ] Intent Matching Engine
- [ ] Negotiation Protocol
- [ ] Deal Smart Contract

### Phase 3: Integration
- [ ] Reputation Contract
- [ ] Message Passing
- [ ] Dashboard UI

## Code-Struktur

```
/agentlink-a2a
├── src/
│   ├── x402/
│   │   ├── parser.ts
│   │   ├── generator.ts
│   │   └── verifier.ts
│   ├── a2a/
│   │   ├── matcher.ts
│   │   ├── negotiator.ts
│   │   └── messenger.ts
│   ├── contracts/
│   │   ├── Reputation.sol
│   │   └── DealFactory.sol
│   └── index.ts
└── tests/
    ├── x402.test.ts
    └── a2a.test.ts
```

## Nächste Schritte

1. x402 Parser implementieren
2. Intent Matching Engine bauen
3. Erste A2A Kommunikation testen
4. Reputation Contract deployen
