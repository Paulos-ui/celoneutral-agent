# Deployment Guide — CeloNeutral Agent

End-to-end steps to take this from source to a live mainnet product with a
deployed contract, registered ERC-8004 agent, running agent loop, and a public
frontend on Vercel.

> **There is no separate web backend.** The on-chain vault is the backend; the
> only off-chain process is the agent script. So you deploy three things:
> the **contract**, the **agent**, and the **frontend**.

---

## 0. Prerequisites

- Node.js 18+ and npm.
- A **dedicated deployer wallet** (not your personal wallet) funded with a small
  amount of **CELO** for gas. Get CELO from an exchange or bridge.
- A **WalletConnect / Reown** project id (free): https://cloud.reown.com
- A **Celoscan** API key (free): https://celoscan.io/myapikey

> Safety: do a full dry run on **Alfajores testnet** before mainnet. Testnet CELO
> is free from the Celo faucet and the exact same scripts run with one flag change.

---

## 1. Deploy the contract (the CA)

```bash
cd contracts
npm install
cp .env.example .env
```

Fill `.env`:
```
PRIVATE_KEY=0x<deployer-key>
AGENT_ADDRESS=0x<agent-wallet-address>   # the wallet your agent script will use
CELOSCAN_API_KEY=<celoscan-key>
```

Compile and dry-run on testnet:
```bash
npm run compile
npm run deploy:testnet     # Alfajores — confirm it works
```

Deploy to **Celo mainnet**:
```bash
npm run deploy:mainnet
```

The script prints your **contract address (CA)** and the exact verify command.
Copy the CA. Then verify the source on Celoscan:
```bash
npx hardhat verify --network celo <CA> 0x765DE816845861e75A25fCA122bb6898B8B1282a <AGENT_ADDRESS>
```
(The two constructor args are the stablecoin address and the agent address.)

Optionally set a lending pool so the agent can earn yield:
```bash
# from a hardhat console or a small script, as the owner:
# vault.setLendingPool(<celo-lending-pool-address>)
```

---

## 2. Register the agent on ERC-8004

1. Put your deployed CA and addresses into `agent/agent.json`
   (`owner`, `agentAddress`, `vault`, and `endpoints.website`).
2. Host `agent.json` at a public URL (your Vercel domain or IPFS).
3. Add the registry details to `contracts/.env`:
   ```
   ERC8004_REGISTRY=0x<celo-erc8004-identity-registry>   # verify current address
   AGENT_DOMAIN=your-deploy.vercel.app
   AGENT_ADDRESS=0x<agent-wallet-address>
   ```
4. Register:
   ```bash
   cd contracts
   npm run register
   ```
5. Read the `AgentRegistered` event in the receipt to get your **agentId**.

> Confirm the canonical Celo ERC-8004 registry address and the exact entrypoint
> name from the official ERC-8004 / Celo reference before running — the script's
> ABI fragment is a one-line swap if the deployed registry differs.

---

## 3. Run the agent (off-chain autonomy)

```bash
cd agent
npm init -y && npm install viem
export CELO_RPC="https://forno.celo.org"
export VAULT_ADDRESS="0x<your-CA>"
export AGENT_PRIVATE_KEY="0x<agent-key>"   # the key for AGENT_ADDRESS
npx tsx runAgent.ts
```

For real autonomy, run it on a schedule — pick one:
- **cron** on a small VPS: `*/5 * * * * cd /app/agent && node runAgent.js`
- a **systemd timer**
- a **serverless scheduled function** (e.g. a Vercel Cron hitting a route that runs one `tick()`).

Keep `AGENT_PRIVATE_KEY` in a secrets manager, never in the repo.

---

## 4. Deploy the frontend to Vercel

1. Push the repo to GitHub.
2. In Vercel: **New Project → import the repo**. Vercel auto-detects Next.js;
   the project root is the repo root, so **no root-directory override needed**.
   (The `contracts/` and `agent/` folders are excluded from the frontend build
   via `tsconfig.json` and have their own dependencies.)
3. Add Environment Variables (Project → Settings → Environment Variables):
   ```
   NEXT_PUBLIC_WALLETCONNECT_ID = <reown-project-id>
   NEXT_PUBLIC_VAULT_ADDRESS    = <your-CA>
   NEXT_PUBLIC_STABLE_ADDRESS   = 0x765DE816845861e75A25fCA122bb6898B8B1282a
   NEXT_PUBLIC_AGENT_ID         = <agentId from step 2>
   ```
4. **Deploy.** Vercel runs `next build` and gives you a public URL.
5. Update `agent/agent.json` `endpoints.website` to the live URL and re-host it
   (and re-register only if the domain changed).

---

## 5. Submission checklist

- [ ] Contract deployed to Celo mainnet and **verified on Celoscan** (paste the CA in your submission).
- [ ] At least one real transaction of each type (deposit, supplyToAave, executePayment) — link them on Celoscan as proof of onchain activity.
- [ ] Agent registered on ERC-8004; `agentId` shown on the live site.
- [ ] Frontend live on Vercel; wallet connect + deposit working against the real CA.
- [ ] README + ARTICLE explain the product and why it fits the hackathon.

---

## Troubleshooting

- **Wallet won't connect / no mobile wallets:** `NEXT_PUBLIC_WALLETCONNECT_ID` is missing or wrong.
- **`deposit` reverts:** the two-step approve didn't complete, or you're on the wrong network — the UI targets Celo mainnet (42220).
- **Verify fails:** the constructor args passed to `hardhat verify` must match the deploy exactly (stablecoin, then agent).
- **Wrong decimals:** cUSD is 18 decimals (default in the UI). If you switch the vault to native USDC, change `DECIMALS` in `app/deposit/page.tsx` to 6.
