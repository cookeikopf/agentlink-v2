# DEPLOYMENT READINESS

## Current Status
- ✅ Production build compiles successfully.
- ✅ Lint and typecheck are passing.
- ✅ CI workflow runs lint + typecheck + build.
- ✅ Health endpoint now reports deployment-readiness and missing env vars.
- ✅ Demo/mock seed endpoint is removed (`410 Gone`).

## Runtime Preconditions
Set these environment variables in deployment:
- `NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS`
- `NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_CHAIN_ID`

## Verification Steps (before go-live)
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. Deploy to staging and validate `/api/health` returns `deploymentReady: true`.
6. Execute a real payment flow on Base Sepolia and confirm webhook delivery.

## Open Hardening Items (industry-standard)
- Add automated smoke tests for critical API routes.
- Add explicit webhook signature verification tests.
- Add observability sinks (logs/traces/alerts) for payment failures.
