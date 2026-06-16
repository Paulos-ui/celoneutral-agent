# CeloNeutral Agent

> Autonomous stable-yield agent on Celo that lets users earn yield on stablecoins while enabling real payments directly from the position.

**CeloNeutral** is an onchain agent for the Celo Onchain Agents Hackathon. Users
deposit cUSD or USDC into a non-custodial vault; an autonomous agent puts that
capital to work earning yield in a lending market, and settles real-world
payments **directly from the position** — so funds never sit idle and never need
a manual withdraw-then-send round trip.

---

## Why this is a strong submission

| Hackathon criterion | How CeloNeutral meets it |
| --- | --- |
| **Real onchain activity** | Deposits, withdrawals, yield allocation and payments are all real Celo mainnet transactions through `CeloNeutralVault`. |
| **Utility for payments** | `executePayment()` settles invoices straight from the yielding vault — stablecoins on Celo are built for payments, and this closes the loop. |
| **Autonomous agent behaviour** | An off-chain agent (`agent/runAgent.ts`) holds a dedicated key and calls `supplyToAave()` / `executePayment()` without user intervention. |
| **ERC-8004 registration** | The agent publishes `agent.json` and registers on Celo's ERC-8004 Identity Registry to obtain a verifiable `agentId`, surfaced on the site. |

---

## Architecture

```
User ──deposit──▶  CeloNeutralVault (Celo mainnet)  ◀──manages──  Autonomous Agent
                         │   │                                      (holds agent key)
                  withdraw   │ supplyToAave ──▶ Lending market (yield)
                             └ executePayment ──▶ Merchant / payee
```

- **Frontend** (`app/`, `components/`, `lib/`) — Next.js 15 + Tailwind + wagmi/viem + RainbowKit. Connect a wallet, deposit/withdraw, view your live position.
- **Contract** (`contracts/`) — `CeloNeutralVault.sol`, a clean OpenZeppelin-based vault with user deposit/withdraw and two agent-gated functions. Hardhat for deploy + verify.
- **Agent** (`agent/`) — the off-chain loop that drives yield allocation and payments. There is **no separate web backend**; the vault is the backend.

---

## Quick start

### 1. Frontend
```bash
npm install
cp .env.local.example .env.local   # fill in WalletConnect id + vault address
npm run dev                         # http://localhost:3000
```

### 2. Contracts
```bash
cd contracts
npm install
cp .env.example .env                # PRIVATE_KEY, AGENT_ADDRESS, CELOSCAN_API_KEY
npm run compile
npm run deploy:testnet              # dry-run on Alfajores first
npm run deploy:mainnet              # deploy to Celo mainnet (42220)
```

### 3. Agent
```bash
cd agent
npm install viem
# set CELO_RPC, VAULT_ADDRESS, AGENT_PRIVATE_KEY in your environment
npx tsx runAgent.ts
```

Full step-by-step (including ERC-8004 registration and Vercel) is in
[`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## Smart contract

`CeloNeutralVault.sol` exposes:

- `deposit(amount)` / `withdraw(amount)` — user-facing, principal-tracked.
- `supplyToAave(amount)` — **agent only**, moves idle funds to a lending pool.
- `executePayment(to, amount, ref)` — **agent only**, settles a payment with an off-chain invoice reference.
- `setAgent` / `setLendingPool` — owner admin.

Built on OpenZeppelin `Ownable`, `ReentrancyGuard`, and `SafeERC20`. The lending
pool address is configurable rather than hardcoded so deployment can't be bricked
by a stale address.

**Celo mainnet stablecoins** (verify before use):
- cUSD `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- USDC `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`

---

## ERC-8004

The agent's identity metadata lives in [`agent/agent.json`](./agent/agent.json).
Host it publicly, then run `contracts/scripts/registerAgent.ts` to register on the
Celo ERC-8004 Identity Registry and receive an `agentId`. Set
`NEXT_PUBLIC_AGENT_ID` and the site renders it as a verifiable badge.

> Confirm the current Celo ERC-8004 registry address and function signature from
> the official reference before registering — the script is a thin wrapper so
> swapping the ABI is a one-line change.

---

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · wagmi · viem ·
RainbowKit · Solidity 0.8.24 · Hardhat · OpenZeppelin · Celo mainnet.

## Disclaimer

This is hackathon software. Yield is variable and not guaranteed. Smart-contract
and protocol risk exist. Not financial advice. Audit before handling real funds at scale.

## License

MIT — see [LICENSE](./LICENSE).
