import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Body face: Inter. Display face: Space Grotesk (geometric, fintech feel).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "CeloNeutral Agent — Stable Yield + Payments on Celo",
  description:
    "An autonomous onchain agent that earns yield on your stablecoins and settles real-world payments directly from your position. Built on Celo.",
  keywords: ["Celo", "stablecoin", "yield", "cUSD", "USDC", "payments", "ERC-8004", "agent"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans text-white">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
