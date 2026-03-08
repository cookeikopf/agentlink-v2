# 🎛️ OPTION B: DU HAST DIE KONTROLLE

**Erstellt:** 2026-03-09 02:22 AM  
**Status:** Du übernimmst alle Wallets

---

## 📋 SCHRITT 1: WALLET ERSTELLEN (5 Min)

### Option A: Mit Foundry (Empfohlen)
```bash
# Wallet erstellen
cd /root/.openclaw/workspace/agentlink-contracts
export PATH="$PATH:$HOME/.foundry/bin"

cast wallet new --json
```

**Output:**
```json
{
  "address": "0x...",
  "private_key": "0x..."
}
```

### Option B: Mit ethers.js (JavaScript)
```bash
cd /root/.openclaw/workspace/agentlink-platform
node -e "
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
"
```

---

## 📋 SCHRITT 2: SEPOLIA ETH BESORGEN (10 Min)

### Faucet Optionen:

1. **Base Sepolia Faucet (Empfohlen)**
   - URL: https://www.coinbase.com/faucets/base-sepolia-faucet
   - Gibt: 0.001 ETH pro Tag
   - Brauchst: Coinbase Account

2. **Alchemy Faucet**
   - URL: https://sepoliafaucet.com/
   - Gibt: 0.5 ETH
   - Brauchst: Alchemy Account

3. **Google Cloud Faucet**
   - URL: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
   - Gibt: 0.05 ETH
   - Brauchst: Google Account

### Anforderungen:
- Mindestens: 0.001 ETH (für Deployment)
- Empfohlen: 0.01 ETH (für mehrere Deployments)

---

## 📋 SCHRITT 3: CONTRACTS DEPLOYEN (15 Min)

### 1. Environment Setup
```bash
cd /root/.openclaw/workspace/agentlink-contracts
export PATH="$PATH:$HOME/.foundry/bin"

# Private Key als Variable (nicht im History!)
read -s -p "Private Key: " PK
echo
```

### 2. AgentReputation Deployen
```bash
forge create src/AgentReputation.sol:AgentReputation \
  --rpc-url https://sepolia.base.org \
  --private-key $PK \
  --constructor-args 0xYOUR_TREASURY_ADDRESS \
  --verify \
  --etherscan-api-key YOUR_ETHERSCAN_KEY
```

**Output speichern!** Du bekommst:
- `Deployed to: 0x...` ← **Diese Adresse notieren!**
- `Transaction hash: 0x...`

### 3. PaymentRouter Deployen
```bash
# Base Sepolia USDC Address
USDC="0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Treasury (deine Wallet-Adresse)
TREASURY="0xYOUR_WALLET_ADDRESS"

# Fee: 1% = 100 (Basis Punkte)
FEE=100

forge create src/PaymentRouter.sol:PaymentRouter \
  --rpc-url https://sepolia.base.org \
  --private-key $PK \
  --constructor-args $TREASURY $USDC $FEE \
  --verify \
  --etherscan-api-key YOUR_ETHERSCAN_KEY
```

---

## 📋 SCHRITT 4: TESTEN (10 Min)

### 1. Balance prüfen
```bash
# Dein ETH Balance
cast balance 0xYOUR_ADDRESS --rpc-url https://sepolia.base.org

# USDC Balance (nachdem du welche hast)
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "balanceOf(address)(uint256)" \
  0xYOUR_ADDRESS \
  --rpc-url https://sepolia.base.org
```

### 2. Contract verifizieren
```bash
# AgentReputation Info abrufen
cast call 0xAGENT_REPUTATION_ADDRESS \
  "owner()(address)" \
  --rpc-url https://sepolia.base.org

# PaymentRouter Info
cast call 0xPAYMENT_ROUTER_ADDRESS \
  "treasury()(address)" \
  --rpc-url https://sepolia.base.org
```

---

## 📋 SCHRITT 5: USDC BESORGEN (Optional)

Für echte Tests brauchst du Sepolia USDC:

```bash
# USDC Faucet (manuell)
# 1. Geh zu: https://faucet.circle.com/
# 2. Wähle "Sepolia"
# 3. Gib deine Wallet-Adresse ein
# 4. Erhalte 100 USDC
```

---

## 🎯 DEINE DEPLOYED CONTRACTS

| Contract | Adresse | Status |
|----------|---------|--------|
| AgentReputation | `0x...` | ⏳ Pending |
| PaymentRouter | `0x...` | ⏳ Pending |

---

## 📞 WENN DU HILFE BRAUCHST

**Ich kann dir helfen bei:**
- ✅ Fehlermeldungen debuggen
- ✅ Befehle erklären
- ✅ Test-Transaktionen schreiben
- ✅ Dokumentation erstellen

**Ich kann NICHT:**
- ❌ Deinen Private Key sehen/kennen
- ❌ Transaktionen für dich signieren
- ❌ Auf dein Wallet zugreifen

---

## 🚀 NÄCHSTE SCHRITTE

1. **Wallet erstellen** (jetzt)
2. **Sepolia ETH holen** (Faucet)
3. **Contracts deployen** (Befehle oben)
4. **Adressen mir zeigen** (für Dokumentation)

**Bereit?** Sag mir einfach "Ich fange an" oder stell Fragen! 🎉
