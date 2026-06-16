import { ethers } from "hardhat";

// Celo MAINNET token addresses — verify before running.
const STABLES: Record<string, string> = {
  cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438", // CELO is also an ERC-20
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const tokenKey = (process.env.TOKEN ?? "cUSD").toUpperCase() === "CELO" ? "CELO" : (process.env.TOKEN ?? "cUSD");
  const stable = STABLES[tokenKey] ?? STABLES.cUSD;
  const agent = process.env.AGENT_ADDRESS ?? deployer.address;

  console.log(`Deploying a vault for token: ${tokenKey} (${stable})`);

  const Vault = await ethers.getContractFactory("CeloNeutralVault");
  const vault = await Vault.deploy(stable, agent);
  await vault.waitForDeployment();

  const addr = await vault.getAddress();
  console.log("CeloNeutralVault deployed to:", addr);
  console.log("Token:", stable, "| Agent:", agent);
  console.log(`Verify:  npx hardhat verify --network celo ${addr} ${stable} ${agent}`);
  if (tokenKey === "CELO") {
    console.log("\nSet this in Vercel:  NEXT_PUBLIC_VAULT_ADDRESS_CELO=" + addr);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
