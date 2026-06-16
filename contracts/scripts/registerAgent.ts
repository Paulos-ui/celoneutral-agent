import { ethers } from "hardhat";

const REGISTRY_ABI = [
  "function register(string agentURI) returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

async function main() {
  const REGISTRY = process.env.ERC8004_REGISTRY!;
  const AGENT_URI = process.env.AGENT_DOMAIN!; // reading the AGENT_DOMAIN you already set
  if (!REGISTRY || !AGENT_URI) throw new Error("Set ERC8004_REGISTRY and AGENT_DOMAIN in .env");

  const [signer] = await ethers.getSigners();
  const registry = new ethers.Contract(REGISTRY, REGISTRY_ABI, signer);

  console.log("Registering agentURI:", AGENT_URI);
  const tx = await registry.register(AGENT_URI);
  const receipt = await tx.wait();
  console.log("Registered. Tx:", receipt?.hash);

  const ev = receipt?.logs
    .map((l: any) => { try { return registry.interface.parseLog(l); } catch { return null; } })
    .find((p: any) => p?.name === "Transfer");
  if (ev) console.log("Your agentId (tokenId):", ev.args.tokenId.toString());
}

main().catch((e) => { console.error(e); process.exit(1); });