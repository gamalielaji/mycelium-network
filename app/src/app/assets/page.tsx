"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMyAssets } from "@/hooks/use-my-assets";
import { shortenPubkey, formatDate } from "@/lib/format";
import {
  IP_TYPE_LABELS,
  IP_TYPE_ICONS,
  IP_STATUS_LABELS,
  IP_STATUS_COLORS,
} from "@/lib/types";

export default function AssetsPage() {
  const { connected } = useWallet();
  const { data: assets, isLoading, error } = useMyAssets();

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
        <p className="text-gray-400">
          Connect your Solana wallet to view your registered IP assets.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My IP Assets</h1>
          <p className="text-gray-400 mt-1">
            {assets?.length ?? 0} registered assets
          </p>
        </div>
        <Link
          href="/register"
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg text-sm"
        >
          + Register New
        </Link>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl border border-[var(--card-border)] bg-[var(--card)] animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          Failed to load assets: {(error as Error).message}
        </div>
      )}

      {assets && assets.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-xl font-semibold mb-2">No IP Assets Yet</h2>
          <p className="text-gray-400 mb-4">
            Register your first IP to see it here.
          </p>
          <Link
            href="/register"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg text-sm"
          >
            Register IP →
          </Link>
        </div>
      )}

      {assets && assets.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Link
              key={asset.pubkey}
              href={`/asset/${asset.pubkey}`}
              className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-green-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">
                  {IP_TYPE_ICONS[asset.ipType]}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    IP_STATUS_COLORS[asset.status]
                  }`}
                >
                  {IP_STATUS_LABELS[asset.status]}
                </span>
              </div>

              <h3 className="font-semibold text-sm group-hover:text-green-400 transition-colors">
                {IP_TYPE_LABELS[asset.ipType]}
              </h3>

              <div className="mt-3 space-y-1 text-xs font-mono text-gray-500">
                <div>
                  PDA: {shortenPubkey(asset.pubkey, 6)}
                </div>
                <div>
                  Hash: {asset.contentHash.slice(0, 16)}...
                </div>
                <div>
                  {formatDate(asset.registrationTimestamp)}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span>v{asset.version}</span>
                {asset.licenseCount > 0 && (
                  <span>📜 {asset.licenseCount} licenses</span>
                )}
                {asset.wipoAligned && (
                  <span className="text-green-500">WIPO ✓</span>
                )}
                {asset.countryOfOrigin && (
                  <span>🌍 {asset.countryOfOrigin}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
