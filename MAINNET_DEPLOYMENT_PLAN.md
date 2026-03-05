# AgentLink Mainnet Deployment Plan

## 🎯 Ziel: Production Deployment auf Base Mainnet

## Voraussetzungen

### 1. Finanzierung
- [ ] Gas Fees: ~0.05 ETH für Contracts
- [ ] Initial USDC für Testing: ~100 USDC
- [ ] Buffer für unvorhergesehene Kosten

### 2. Sicherheit
- [ ] Contracts auditieren lassen (optional für MVP)
- [ ] Testnet Tests abschließen ✅ (DONE)
- [ ] Emergency Pause Mechanismen prüfen

### 3. Infrastruktur
- [ ] RPC Node (Alchemy/Infura)
- [ ] Monitoring Setup
- [ ] Backup Strategie

## Deployment Schritte

### Phase 1: Contracts (Tag 1)

```bash
# 1. AgentIdentity deployen
forge create --rpc-url $BASE_MAINNET_RPC \
  --constructor-args "AgentLink Identity" "ALINK" "https://api.agentlink.io/metadata/" $OWNER_ADDRESS \
  src/AgentIdentity.sol:AgentIdentity

# 2. PaymentRouter deployen  
forge create --rpc-url $BASE_MAINNET_RPC \
  --constructor-args $USDC_MAINNET $TREASURY_ADDRESS 100 $OWNER_ADDRESS \
  src/PaymentRouter.sol:PaymentRouter

# 3. AgentReputation deployen
forge create --rpc-url $BASE_MAINNET_RPC \
  src/AgentReputation.sol:AgentReputation
```

### Phase 2: Configuration (Tag 2)

1. **AgentIdentity konfigurieren:**
   - Public Minting aktivieren
   - Mint Price setzen
   - PaymentRouter als authorized minter hinzufügen

2. **PaymentRouter konfigurieren:**
   - Fee Basis Points setzen (100 = 1%)
   - Treasury Adresse setzen
   - AgentReputation als authorized updater

3. **AgentReputation konfigurieren:**
   - PaymentRouter als authorized updater
   - Initial scores setzen

### Phase 3: Testing (Tag 3)

1. Mint Test Agenten
2. Test-Zahlungen durchführen
3. Reputation Updates testen
4. Emergency Funktionen testen

### Phase 4: Frontend (Tag 4-5)

1. Environment Variables updaten
2. Auf Vercel deployen
3. Custom Domain konfigurieren
4. SSL/HTTPS einrichten

## Kosten Schätzung

| Item | Kosten |
|------|--------|
| Contract Deployment | ~0.03 ETH (~$75) |
| Initial Testing | ~0.02 ETH (~$50) |
| Vercel Pro (optional) | $20/Monat |
| RPC Node | $0-50/Monat |
| **Total Initial** | **~$125-175** |
| **Total Monthly** | **~$20-70** |

## Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| High Gas Fees | Mittel | Mittel | Deployment zu Stoßzeiten |
| Contract Bugs | Niedrig | Hoch | Extensive Tests auf Testnet |
| Network Congestion | Mittel | Niedrig | Monitoring + Alerts |
| Treasury Hack | Niedrig | Sehr hoch | Multi-sig Wallet |

## Post-Deployment

### Monitoring
- [ ] Transaction Volume tracken
- [ ] Error Rates monitoren
- [ ] Gas Costs optimieren
- [ ] User Feedback sammeln

### Marketing
- [ ] Twitter Announcement
- [ ] Base Ecosystem Portal
- [ ] Developer Docs
- [ ] Demo Video

### Nächste Features
- [ ] Cross-chain Support
- [ ] More Payment Tokens
- [ ] Advanced Matching Algorithm
- [ ] Mobile App

## Checkliste

- [ ] Contracts auf Testnet vollständig getestet ✅
- [ ] Security Review durchgeführt
- [ ] Mainnet ETH/USDC bereitgestellt
- [ ] Deployment Script erstellt
- [ ] Rollback Plan bereit
- [ ] Monitoring eingerichtet
- [ ] Team bereit für Support

## Zeitplan

| Woche | Task |
|-------|------|
| Woche 1 | Security Review, Final Tests |
| Woche 2 | Mainnet Deployment |
| Woche 3 | Frontend Launch, Marketing |
| Woche 4 | Monitoring, Bugfixes |

## Emergency Contacts

- Deployer Wallet: 0xad5505418879819aC0F8e1b92794ce1F47D96205
- Backup Wallet: [TODO]
- Treasury Multi-sig: [TODO]

---

**Status:** Bereit für Mainnet Deployment nach finaler Überprüfung
**Letzte Aktualisierung:** 2026-03-05
