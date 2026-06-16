# CeloNeutral: Making Stablecoins Earn While They Wait to Be Spent

*An autonomous onchain agent on Celo that turns idle stablecoins into yield —
and lets you pay straight from the position.*

---

## The problem with "stable" money

Stablecoins solved volatility but created a quieter inefficiency: the moment you
hold cUSD or USDC for spending, that money stops working. You either earn yield
**or** keep funds liquid for payments — rarely both. Every dollar parked for a
future invoice is a dollar earning nothing.

For consumers and small businesses on Celo — a chain explicitly built for
real-world stablecoin payments — that tradeoff is exactly the wrong one to force.

## The idea

**CeloNeutral** removes the choice. You deposit stablecoins once into a
non-custodial vault. From there, an autonomous agent does two things on your
behalf, continuously:

1. **Earns yield** by allocating idle balance to a Celo lending market.
2. **Pays** real-world invoices directly from the position when they come due.

No manual "withdraw, then send." No capital sitting idle between payments. The
money is always working and always spendable.

## How it works

The core is a small, auditable Solidity vault, `CeloNeutralVault`:

- Users call `deposit()` and `withdraw()` — funds are non-custodial and tracked per user.
- A designated **agent** (and only the agent) can call `supplyToAave()` to route
  idle funds into yield, and `executePayment()` to settle a payment with an
  off-chain invoice reference attached on-chain for reconciliation.
- Everything is gated with OpenZeppelin's `Ownable`, `ReentrancyGuard`, and
  `SafeERC20`. The lending pool is a configurable address, not a hardcoded one,
  so the vault can adapt without redeployment.

The agent itself is a lightweight off-chain loop holding a dedicated key. It
watches the vault, allocates yield above a threshold, and works through a payment
queue. There is no heavy backend — the chain is the backend.

## Why Celo

Celo's stablecoins (cUSD, native USDC) and low fees make micro-payments and
recurring settlement actually viable, which is the whole point of paying from a
yielding position. Building the agent here means the "pay" half of the loop isn't
a demo — it's the chain's core use case.

## Onchain identity with ERC-8004

An autonomous agent moving other people's money should be **identifiable and
accountable**. CeloNeutral registers on Celo's ERC-8004 Identity Registry,
publishing an `agent.json` and receiving a verifiable `agentId`. That id is shown
on the site and links back to the on-chain record — so anyone can confirm which
agent is acting, and under whose ownership.

## What's real today

This is a hackathon MVP, but it's wired for real activity, not a mock:

- The vault is deployable and verifiable on **Celo mainnet**.
- The frontend connects real wallets and submits real deposit/withdraw transactions.
- The agent executes real `supplyToAave` and `executePayment` calls.
- The agent is registered under ERC-8004.

## What's next

- Share-based yield accounting so depositors' balances reflect accrued interest automatically.
- A recipient allowlist and spending limits on the agent for safer payment automation.
- A merchant-facing "request payment" flow that drops invoices straight into the agent's queue.
- A formal audit before scaling beyond hackathon amounts.

## Try it

The vault is open source under MIT. Deploy your own, register an agent, and pay
from yield. Stable money shouldn't sit still.

---

*Disclaimer: hackathon software. Yield is variable and not guaranteed; smart-contract
and protocol risk exist. Not financial advice.*
