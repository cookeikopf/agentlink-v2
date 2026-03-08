# 🧪 SELBST TESTEN - Komplette Anleitung

**Contracts:**
- AgentReputation: `0x7C56670BA983546A650e70E8D106631d69a56000`
- PaymentRouter: `0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59`
- USDC (Sepolia): `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

---

## 🔧 TOOLS

### Option 1: Cast (Foundry CLI)
```bash
# Installiert in: $HOME/.foundry/bin
export PATH="$PATH:$HOME/.foundry/bin"

# Balance checken
cast balance 0xDEINE_ADRESSE --rpc-url https://sepolia.base.org

# Contract call
cast call 0x7C56670BA983546A650e70E8D106631d69a56000 \
  "owner()(address)" \
  --rpc-url https://sepolia.base.org
```

### Option 2: Etherscan UI
1. Geh zu: https://sepolia.basescan.org/
2. Contract Adresse eingeben
3. "Contract" → "Read Contract" / "Write Contract"
4. Mit Wallet verbinden (MetaMask)

---

## 🧪 TEST 1: AgentReputation Basics

### 1.1 Owner checken (Read)
```bash
cast call 0x7C56670BA983546A650e70E8D106631d69a56000 \
  "owner()(address)" \
  --rpc-url https://sepolia.base.org
```
**Erwartet:** 0x7CbCbFcE82d5d2995b05D59FC05d7fF807004e62

### 1.2 Treasury checken (Read)
```bash
cast call 0x7C56670BA983546A650e70E8D106631d69a56000 \
  "treasury()(address)" \
  --rpc-url https://sepolia.base.org
```

### 1.3 Review Fee checken (Read)
```bash
cast call 0x7C56670BA983546A650e70E8D106631d69a56000 \
  "reviewFee()(uint256)" \
  --rpc-url https://sepolia.base.org
```

---

## 🧪 TEST 2: PaymentRouter Basics

### 2.1 Treasury checken (Read)
```bash
cast call 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "treasury()(address)" \
  --rpc-url https://sepolia.base.org
```

### 2.2 Fee Percent checken (Read)
```bash
cast call 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "platformFeePercent()(uint256)" \
  --rpc-url https://sepolia.base.org
```
**Erwartet:** 100 (1%)

### 2.3 USDC Token checken (Read)
```bash
cast call 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "supportedTokens(address)(bool)" \
  0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  --rpc-url https://sepolia.base.org
```
**Erwartet:** true

---

## 🧪 TEST 3: Agent erstellen (Write)

**Benötigt:**
- Wallet mit Sepolia ETH
- Wallet mit Sepolia USDC

### 3.1 USDC Faucet (hol dir Test-USDC)
https://faucet.circle.com/ → Sepolia → Deine Adresse

### 3.2 Als Agent registrieren (PaymentRouter)
```bash
# Dein Private Key (von deinem Wallet)
PK="0xDEIN_PRIVATE_KEY"

# Agent hinzufügen
cast send 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "addAgent(address)" \
  0xDEINE_WALLET_ADRESSE \
  --rpc-url https://sepolia.base.org \
  --private-key $PK
```

### 3.3 Prüfen ob du Agent bist (Read)
```bash
cast call 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "hasRole(bytes32,address)(bool)" \
  0x6a... # AGENT_ROLE hash \
  0xDEINE_WALLET_ADRESSE \
  --rpc-url https://sepolia.base.org
```

---

## 🧪 TEST 4: Payment Flow

### 4.1 USDC depositen
```bash
# USDC approve (zuerst)
cast send 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "approve(address,uint256)" \
  0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  1000000 \
  --rpc-url https://sepolia.base.org \
  --private-key $PK

# Dann deposit
cast send 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "deposit(address,uint256)" \
  0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  1000000 \
  --rpc-url https://sepolia.base.org \
  --private-key $PK
```

### 4.2 Balance checken
```bash
cast call 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "getBalance(address,address)(uint256)" \
  0xDEINE_WALLET_ADRESSE \
  0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  --rpc-url https://sepolia.base.org
```

### 4.3 Payment erstellen
```bash
cast send 0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59 \
  "createPayment(address,uint256,address,bytes32,uint256)" \
  0xEMPFAENGER_ADRESSE \
  500000 \
  0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  0 \
  --rpc-url https://sepolia.base.org \
  --private-key $PK
```

---

## 🧪 TEST 5: Reputation System

### 5.1 Reputation checken (Read)
```bash
cast call 0x7C56670BA983546A650e70E8D106631d69a56000 \
  "getReputation(address)(uint256,uint256,uint256,uint256,uint256,bool)" \
  0xAGENT_ADRESSE \
  --rpc-url https://sepolia.base.org
```

**Output:** (score, reviewCount, successfulDeals, failedDeals, avgScore, exists)

### 5.2 Review hinzufügen (Write - kostet ETH Fee)
```bash
cast send 0x7C56670BA983546A650e70E8D106631d69a56000 \
  "addReview(address,uint256,string,bytes32)" \
  0xAGENT_ADRESSE \
  500 \
  "Great service!" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  --rpc-url https://sepolia.base.org \
  --private-key $PK \
  --value 0.001ether
```

---

## 🐛 FEHLERBEHEBUNG

### "insufficient funds"
→ Brauchst mehr Sepolia ETH
→ https://www.coinbase.com/faucets/base-sepolia-faucet

### "execution reverted"
→ Contract prüfen: Pause? Berechtigung?
→ Logs checken auf Etherscan

### "nonce too low"
→ Warte 10 Sekunden, retry

---

## 📊 MONITORING

**Deine Deployed Contracts:**
- https://sepolia.basescan.org/address/0x7C56670BA983546A650e70E8D106631d69a56000
- https://sepolia.basescan.org/address/0xf17EDf5B92aAa0b7a3FE7D123906c71f94516D59

**Eigene Transaktionen tracken:**
https://sepolia.basescan.org/address/DEINE_ADRESSE

---

## 🎯 EMPFEHLENER TEST-FLOW

1. ✅ Basics lesen (Owner, Treasury)
2. ✅ USDC holen (Faucet)
3. ✅ Agent registrieren
4. ✅ USDC depositen
5. ✅ Payment erstellen
6. ✅ Reputation checken
7. ✅ Review schreiben

---

**Viel Erfolg beim Testen!** 🚀
Bei Fragen: Einfach fragen!
