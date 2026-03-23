"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { CLUSTER } from "@/lib/constants";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export function Header() {
  const { connected } = useWallet();

  return (
    <header className="border-b border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍄</span>
            <span className="font-bold text-lg">Mycelium</span>
            {CLUSTER === "devnet" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-mono">
                DEVNET
              </span>
            )}
          </Link>

          {connected && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/register"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Register IP
              </Link>
              <Link
                href="/assets"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                My Assets
              </Link>
            </nav>
          )}
        </div>

        <WalletMultiButton />
      </div>
    </header>
  );
}
