import { ethers } from "hardhat";

/**
 * Register the CeloNeutral agent on the ERC-8004 Identity Registry.
 *
 * IMPORTANT: confirm the current Celo ERC-8004 registry address and the exact
 * function signature from the official Celo / ERC-8004 reference before running.
 * This wrapper assumes a `newAgent(string agentDomain, address agentAddress)`
 * style entrypoint; swap the ABI fragment below if the deployed registry differs.
 */

const REGISTRY_ABI = [
  "function newAgent(string agentDomain, address agentAddress) returns (uint256 agentId)",
  "event AgentRegistered(uint256 indexed agentId, string agentDomain, address indexed agentAddress)",
];

async function main() {
  const REGISTRY = process.env.ERC8004_REGISTRY;
  const AGENT_DOMAIN = process.env.AGENT_DOMAIN ?? "your-deploy.vercel.app";
  const AGENT_ADDRESS = process.env.AGENT_ADDRESS;

  if (!REGISTRY || !AGENT_ADDRESS) {
    throw new Error("Set ERC8004_REGISTRY and AGENT_ADDRESS in .env");
  }

  const [signer] = await ethers.getSigners();
  const registry = new ethers.Contract(REGISTRY, REGISTRY_ABI, signer);

  console.log("Registering agent:", AGENT_DOMAIN, "->", AGENT_ADDRESS);
  const tx = await registry.newAgent(AGENT_DOMAIN, AGENT_ADDRESS);
  const receipt = await tx.wait();
  console.log("Registered. Tx:", receipt?.hash);
  console.log("Read the AgentRegistered event in the receipt for your agentId,");
  console.log("then set NEXT_PUBLIC_AGENT_ID in the frontend .env.local.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
