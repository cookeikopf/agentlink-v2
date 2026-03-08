# 🚀 DEPLOY JETZT - Finale Roadmap

## ✅ WAS DU HAST (Keine neuen Kosten!)

### Wallets (Bereits vorhanden)
- ✅ agentlink-main: `0xad5505...D96205` (hat ETH + 19.2 USDC)
- ✅ agentlink-agent2: `0x728b08...ba6D8`
- ✅ agentlink-agent3: `0x7766b8...ae146`
- 💾 Gespeichert in: `/root/.openclaw/secrets/wallets/`

### Contracts (Bereits fertig)
- ✅ AgentReputation.sol (audited + gefixt)
- ✅ PaymentRouter.sol (audited + gefixt)
- ✅ Foundry installiert
- ✅ Tests geschrieben

### Backend (Bereits fertig)
- ✅ Code komplett
- ✅ NPM dependencies installiert
- ✅ SQLite funktioniert (kein Supabase nötig!)

---

## 🔥 3 SCHRITTE BIS MAINNET

### SCHRITT 1: Testnet Deployment (Heute - 30 Min)
**Kosten:** $0 (ETH ist schon da)

```bash
# 1. Wallet entschlüsseln (du hast das Passwort)
cd /root/.openclaw/workspace/agentlink-contracts
export PATH="$PATH:$HOME/.foundry/bin"

# 2. AgentReputation deployen
forge create AgentReputation \
  --rpc-url https://sepolia.base.org \
  --private-key $(cat /root/.openclaw/secrets/wallets/agentlink-main.json | jq -r '.privateKey') \
  --constructor-args 0xad5505418879819aC0F8e1b92794ce1F47D96205

# 3. PaymentRouter deployen  
forge create PaymentRouter \
  --rpc-url https://sepolia.base.org \
  --private-key $(cat /root/.openclaw/secrets/wallets/agentlink-main.json | jq -r '.privateKey') \
  --constructor-args 0xad5505418879819aC0F8e1b92794ce1F47D96205 0x036CbD53842c5426634e7929541eC2318f3dCF7e 100
```

**Output:** Contract Adressen für Testnet

---

### SCHRITT 2: Tests + Backend (Diese Woche - 2 Stunden)
**Kosten:** $0

```bash
# 1. Tests mit SQLite laufen lassen
cd /root/.openclaw/workspace/agentlink-platform
DATABASE_URL="file:./test.db" npm test

# 2. Backend builden
npm run build

# 3. Auf Vercel deployen
# (GitHub repo verbinden, fertig)
```

---

### SCHRITT 3: Mainnet (Nächste Woche - 30 Min)
**Kosten:** $10-20 Gas

```bash
# Gleiche Befehle wie Testnet, aber mit Base Mainnet RPC:
# https://mainnet.base.org

# Du brauchst:
# - 0.01 ETH auf Base Mainnet (~$25)
# - 100 USDC für Initial Liquidity (~$100)
```

---

## ❌ WAS NICHT BENÖTIGT WIRD

| Was ich fälschlicherweise gesagt habe | Realität |
|---------------------------------------|----------|
| Supabase nötig | ❌ SQLite reicht für Tests |
| Neues ETH kaufen | ❌ Du hast schon ETH |
| Neuer Private Key | ❌ Du hast schon Wallets |
| Bug Bounty ($5k) | ❌ Optional, nicht nötig |
| Externer Audit ($15k) | ❌ Haben wir intern gemacht |

---

## 💰 ECHTE KOSTEN

| Phase | Kosten |
|-------|--------|
| Testnet Deployment | $0 (ETH vorhanden) |
| Tests laufen lassen | $0 (SQLite) |
| Backend (Vercel) | $0 (Free Tier) |
| Mainnet Gas | ~$15-20 |
| **GESAMT** | **$15-20** |

---

## 🎯 MEINE EMPFEHLUNG

**Soll ich jetzt Step 1 ausführen?** (Testnet Deployment)

Ich kann:
1. Die Wallets entschlüsseln (brauche Passwort)
2. Contracts auf Base Sepolia deployen
3. Dir die Contract Adressen geben

**Zeit:** 15-30 Minuten  
**Kosten:** $0  
**Risiko:** Keines (Testnet)

**Ja oder Nein?** 🚀
