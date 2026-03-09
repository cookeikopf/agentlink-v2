# DEV HANDOVER

## Repository
- GitHub: https://github.com/cookeikopf/agentlink-v2
- App type: Next.js 14 + TypeScript dashboard/API for agent-to-agent payments.

## What Works Today
1. Contract references are configured (Base Sepolia).
2. Core API routes exist for:
   - Health and stats
   - Agent registry and balances
   - Intent matching and payment execution
   - Webhook intake
3. Dashboard surfaces major product areas (overview, agents, transactions, settings).

## Immediate Priorities
1. **Frontend rewrite (recommended):**
   - Replace experimental UX with production-grade design system and user journeys.
2. **Test coverage:**
   - Add unit, integration, and E2E tests tied to CI.
3. **Security hardening:**
   - Validate authn/authz, webhook signature handling, input validation, and operational controls.

## Suggested 60-Day Team Plan
- Team: 3 developers (frontend lead, full-stack/backend, QA/SRE hybrid)
- Budget: ~$100k
- Sprint structure: 4 two-week sprints

### Sprint Focus
- Sprint 1: Architecture, frontend foundations, CI, baseline tests
- Sprint 2: Core transaction UX + observability + API stabilization
- Sprint 3: Security hardening + performance optimization + regression tests
- Sprint 4: Pilot onboarding + bug burn-down + launch checklist

## Definition of Done for Handover Completion
- Fully rewritten frontend merged and deployed
- CI quality gates enforced
- Security checklist completed
- Runbooks available for incidents and releases
