"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

/** Thin wrapper so the rest of the app imports one button. */
export default function ConnectButton() {
  return <RainbowConnectButton showBalance={false} chainStatus="icon" />;
}
