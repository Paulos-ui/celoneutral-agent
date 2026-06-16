# CeloNeutral Agent

> Autonomous stable-yield agent on Celo that lets users earn yield on stablecoins while enabling real payments directly from the position.

**CeloNeutral** is an onchain agent built for the Celo Onchain Agents Hackathon.
Users deposit cUSD into a non-custodial vault on Celo mainnet. The design pairs
that vault with an autonomous agent that (1) allocates idle deposits to a lending
market to earn yield and (2) settles real-world payments **directly from the
position** — so capital is meant to be always working and always spendable,
without manual withdraw-then-send round trips.

This README is honest about what is live today versus what is on the roadmap see
[Current status](#current-status).

---

## Live deployment (Celo mainnet · chainId 42220)

| Item | Value |
| --- | --- |
| **Vault contract (verified)** | [`0x1eAFcCCF24f3007E64F9cf78b5D4aaA8a8152Cbd`](https://celoscan.io/address/0x1eAFcCCF24f3007E64F9cf78b5D4aaA8a8152Cbd) |
| **Stablecoin accepted** | cUSD `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| **Owner / agent address** | `0xa6a3bd6fb4623f61917abcd13b4c6fde3438ea77` |
| **ERC-8004 Identity Registry** | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| **Agent ID (ERC-8004)** | [`9426`](https://celoscan.io/nft/0x8004a169fb4a3325136eb29fa0ceb6d2e539a432/9426) |

---

## Current status

CeloNeutral is a working MVP, deployed and verified on Celo mainnet. To be clear
about scope:

**Live and functional today**
- **Deposit** — connect a wallet, approve cUSD, and deposit into the vault. Funds
  transfer on-chain and per-user balances are tracked. Real mainnet transactions.
- **Withdraw** — withdraw principal back to your wallet at any time. No lock-up.
- **Autonomous-agent architecture** — the vault exposes agent-gated
  `supplyToAave()` and `executePayment()` hooks, callable only by the registered
  agent address.
- **ERC-8004 identity** — the agent is registered on Celo's ERC-8004 Identity
  Registry as agent ID `9426`, with metadata published in `agent/agent.json`.

**Not yet live (roadmap)**
- **Yield generation is not active in this version.** `supplyToAave()` is a stub:
  the lending-market integration is not yet wired in and no lending pool is
  connected, so deposited funds currently sit idle in the vault and a withdrawal
  returns exactly the principal deposited. The APY figures shown in the UI are
  **illustrative projections**, not realized yield.
- **Payment automation** is scaffolded (`executePayment` + the agent loop) but not
  yet driven by a live invoice source.

In short: the vault, the agent identity, and deposit/withdraw are real on mainnet;
the yield and payment automation are the clearly-scoped next milestones below.

---

## Why this is a strong submission

| Hackathon criterion | How CeloNeutral meets it |
| --- | --- |
| **Real onchain activity** | Contract deployed and verified on Celo mainnet; deposit and withdraw are real on-chain transactions through `CeloNeutralVault`. |
| **Utility for payments** | The vault is purpose-built around `executePayment()` — settling payments directly from a stablecoin position, the core Celo use case. |
| **Autonomous agent behaviour** | Agent-gated `supplyToAave()` / `executePayment()` hooks plus an off-chain agent loop (`agent/runAgent.ts`) designed to act without user intervention. |
| **ERC-8004 registration** | Registered on Celo's ERC-8004 Identity Registry as agent ID `9426`, with on-chain-verifiable metadata. |

---

## Architecture

```
User ──deposit──▶  CeloNeutralVault (Celo mainnet)  ◀──manages──  Autonomous Agent
                         │   │                                      (holds agent key)
                  withdraw   │ supplyToAave ──▶ Lending market (yield)  [roadmap]
                             └ executePayment ──▶ Merchant / payee       [scaffolded]
```

- **Frontend** (`app/`, `components/`, `lib/`) — Next.js 15 + Tailwind + wagmi/viem + RainbowKit. Connect a wallet, deposit/withdraw, view your position.
- **Contract** (`contracts/`) — `CeloNeutralVault.sol`, an OpenZeppelin-based vault with user deposit/withdraw and two agent-gated functions. Hardhat for deploy + verify.
- **Agent** (`agent/`) — the off-chain loop intended to drive yield allocation and payments. There is **no separate web backend**; the vault is the backend.

---

## Smart contract

`CeloNeutralVault.sol` exposes:

- `deposit(amount)` / `withdraw(amount)` — user-facing, principal-tracked. **Live.**
- `supplyToAave(amount)` — **agent only**, intended to move idle funds to a lending pool. **Stub** (integration is roadmap).
- `executePayment(to, amount, ref)` — **agent only**, settles a payment with an off-chain invoice reference.
- `setAgent` / `setLendingPool` — owner admin.

Built on OpenZeppelin `Ownable`, `ReentrancyGuard`, and `SafeERC20`. The lending
pool address is configurable rather than hardcoded.

---

## Quick start

### Frontend
```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_VAULT_ADDRESS, etc.
npm run dev                         # http://localhost:3000
```

### Contracts
```bash
cd contracts
npm install
cp .env.example .env                # PRIVATE_KEY, AGENT_ADDRESS, CELOSCAN_API_KEY
npm run compile
npm run deploy:mainnet              # Celo mainnet (42220)
```

Full deploy + registration + Vercel walkthrough: [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## Roadmap to production

1. **Activate yield** — connect a Celo lending market (e.g. an Aave V3 pool),
   enable the `supply` call in `supplyToAave`, and call `setLendingPool`.
2. **Share-based accounting** — track yield per depositor so withdrawals include
   accrued interest (move from raw principal to a share/`aToken` model).
3. **Payment automation** — feed real invoices into the agent's `executePayment` queue.
4. **Safety** — recipient allowlist and per-tx limits on the agent; a formal audit
   before handling non-trivial funds.

---

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · wagmi · viem ·
RainbowKit · Solidity 0.8.24 · Hardhat · OpenZeppelin · Celo mainnet.

## Disclaimer

Hackathon software, unaudited. **Yield is not active in the current version** —
deposited funds sit idle and are returned as principal on withdrawal; APY figures
in the UI are illustrative. The vault owner/agent can move vault funds via
`executePayment`, so depositors trust the operator. Do not deposit meaningful
funds. Not financial advice.

## License

MIT — see [LICENSE](./LICENSE).