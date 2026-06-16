"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "wagmi/chains";

/**
 * wagmi + RainbowKit configuration.
 * Targets Celo mainnet only. A WalletConnect project id is required for
 * mobile wallet support — get one free at https://cloud.reown.com.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "CeloNeutral Agent",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "PLACEHOLDER_PROJECT_ID",
  chains: [celo],
  ssr: true, // Next.js App Router renders on the server first
});
