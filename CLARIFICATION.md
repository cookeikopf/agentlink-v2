# 📋 OFFENE FRAGEN - KLÄRUNG

## 1️⃣ FRONTEND / VERCEL

**Status:** Backend Code existiert, aber **NOCH NICHT** auf Vercel deployed!

### Was existiert:
- ✅ Next.js App im Ordner `agentlink-platform/`
- ✅ API Routes für Agent-Interaktion
- ✅ Database Models (Prisma)
- ✅ NPM Dependencies installiert

### Was fehlt:
- ❌ Environment Variables (.env)
- ❌ Database Connection (SQLite/PostgreSQL)
- ❌ Vercel Deployment

### Deployment Schritte:
```bash
cd agentlink-platform
# 1. .env erstellen
cp .env.example .env
# 2. Database URL setzen
DATABASE_URL="file:./dev.db"  # SQLite für Tests
# 3. Build
cp -r ../agentlink-contracts/out ./public/contracts  # Contracts kopieren
npm run build
# 4. Vercel CLI
echo "y" | npx vercel --yes
```

---

## 2️⃣ AGENTEN vs MENSCHEN - INTERAKTION

### 🤖 AGENTEN (Machine-to-Machine)
**Weg:** API → Smart Contracts

```
Agent A (Dein Bot)
    ↓ HTTP POST /api/v1/payments
AgentLink API
    ↓ Blockchain Tx
PaymentRouter Contract
    ↓ USDC Transfer
Agent B (Empfänger Bot)
```

**Features:**
- Webhooks für Echtzeit-Benachrichtigungen
- Intent-basierte Matching
- Session Keys für begrenzte Berechtigungen
- Automatische Reputation-Updates

**Beispiel:**
```javascript
// Agent A sendet Payment Intent
const response = await fetch('https://agentlink.io/api/v1/intents', {
  method: 'POST',
  headers: { 'X-API-Key': '...' },
  body: JSON.stringify({
    to: 'agent-b-id',
    amount: '1000000', // 1 USDC
    token: 'USDC'
  })
});
```

---

### 👤 MENSCHEN (Human Interface)
**Weg:** Dashboard → Wallet → Smart Contracts

```
User (Browser + MetaMask)
    ↓ Klick auf "Pay Agent"
Dashboard (Next.js)
    ↓ Wallet Connect
Smart Contract
    ↓ USDC Transfer
Agent Wallet
```

**Features:**
- MetaMask / RainbowKit Integration
- Agent Registry browsen
- Reputation Scores ansehen
- Manuelle Payments senden
- Transaction History

**Beispiel:**
```
1. User öffnet dashboard.vercel.app
2. Verbindet Wallet (MetaMask)
3. Sieht Liste von Agenten mit Reputation
4. Klickt "Pay" bei Agent X
5. MetaMask Popup → Bestätigen
6. Transaction complete!
```

---

### 🔄 ZUSAMMENSPIEL

**Szenario: AI Service Marketplace**

```
Menschlicher User
    ↓ "Ich will Bilder generieren"
Dashboard
    ↓ Findet "ImageBot" (Reputation: 950)
    ↓ Sendet 5 USDC an ImageBot
PaymentRouter
    ↓ Hält Geld in Escrow
    
ImageBot (Agent)
    ↓ Webhook: "Neue Payment Intent"
    ↓ Generiert Bilder
    ↓ Markiert Job als complete
PaymentRouter
    ↓ Released 5 USDC an ImageBot
AgentReputation
    ↓ +10 Reputation für ImageBot
```

---

## 3️⃣ SUPABASE - NOCH NÖTIG?

### KURZ: NEIN, nicht zwingend!

### Optionen:

| Option | Für | Kosten | Setup |
|--------|-----|--------|-------|
| **SQLite** | Tests, Single-User | $0 | Sofort |
| **Supabase** | Production, Multi-User | $0 (Free Tier) | 10 Min |
| **PostgreSQL** | Production, Scale | $5-20/Monat | 30 Min |

### Empfehlung:

**Für JETZT (Testnet Phase):**
- ✅ SQLite reicht völlig
- ✅ Kein Supabase nötig
- ✅ Kein Setup

**Für SPÄTER (Mainnet + echte Nutzer):**
- ⚠️ Supabase empfohlen
- ⚠️ Oder PostgreSQL auf Render/DigitalOcean
- ⚠️ Nur wenn du mehrere Server/ Nutzer hast

### SQLite reicht, weil:
- File-basiert
- Kein Server nötig
- Für 1-10 Nutzer perfekt
- Migration zu PostgreSQL später einfach

---

## 🎯 WAS JETZT ZU TUN IST

### Sofort (du entscheidest):

1. **Dashboard deployen?** (Vercel + SQLite)
   - Zeit: 30 Min
   - Kosten: $0
   
2. **Supabase einrichten?**
   - Zeit: 10 Min
   - Kosten: $0
   - Nur wenn du willst

3. **Oder:** Weiter mit Testnet beobachten?
   - Zeit: 0
   - Warten auf 1 Woche Stabilität

---

**Was willst du als nächstes?** 🚀
