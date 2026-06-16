# CeloNeutral Agent — off-chain runner

The autonomous component that drives the vault. It holds the **agent key** (the
address set as `agent` on `CeloNeutralVault`) and performs two jobs:

1. **Yield** — supplies idle vault balance to a Celo lending market.
2. **Payments** — settles queued real-world payments via `executePayment`.

## Run

```bash
cd agent
npm init -y && npm install viem
export CELO_RPC="https://forno.celo.org"
export VAULT_ADDRESS="0xYourVault"
export AGENT_PRIVATE_KEY="0xAgentKey"   # keep secret; use a dedicated wallet
npx tsx runAgent.ts
```

Schedule it with cron, a systemd timer, or a serverless scheduled function.
There is **no web backend** in this project — the on-chain vault is the backend,
and this script is the only off-chain process.

## ERC-8004

`agent.json` is the metadata this agent publishes. Host it at the URL in your
`agent.json` `endpoints.website`, then register with
`contracts/scripts/registerAgent.ts` to obtain your `agentId`.
