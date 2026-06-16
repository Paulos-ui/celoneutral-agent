import { ethers } from "hardhat";

// Celo MAINNET stablecoins — verify before running.
const STABLES = {
  cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const stable = STABLES.cUSD; // choose the stablecoin to support
  const agent = process.env.AGENT_ADDRESS ?? deployer.address;

  const Vault = await ethers.getContractFactory("CeloNeutralVault");
  const vault = await Vault.deploy(stable, agent);
  await vault.waitForDeployment();

  const addr = await vault.getAddress();
  console.log("CeloNeutralVault deployed to:", addr);
  console.log("Stablecoin:", stable, "| Agent:", agent);
  console.log(`Verify:  npx hardhat verify --network celo ${addr} ${stable} ${agent}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
