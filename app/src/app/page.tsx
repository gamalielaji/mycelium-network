"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="text-6xl mb-6">🍄</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          Mycelium Protocol
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Decentralized IP infrastructure on Solana. Register, license, and
          protect intellectual property with cryptographic proof — for less than
          $0.01.
        </p>
        <div className="flex items-center justify-center gap-4">
          {connected ? (
            <>
              <Link
                href="/register"
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
              >
                Register IP →
              </Link>
              <Link
                href="/assets"
                className="px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 rounded-lg transition-colors"
              >
                My Assets
              </Link>
            </>
          ) : (
            <p className="text-gray-500">Connect your wallet to get started</p>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {[
          {
            icon: "📝",
            title: "Register",
            desc: "Hash your content client-side. Register the SHA-256 proof on Solana with Proof of History timestamp. Costs ~0.004 SOL.",
          },
          {
            icon: "📜",
            title: "License",
            desc: "Create machine-readable license templates. Issue licenses to individuals or AI agents. Automatic royalty splitting.",
          },
          {
            icon: "⚖️",
            title: "Enforce",
            desc: "Generate court-ready evidence packages for 8 jurisdictions. Similarity detection catches infringement automatically.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:glow-green transition-shadow"
          >
            <div className="text-3xl mb-4">{item.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Cost per Registration", value: "< $0.01" },
          { label: "Finality", value: "400ms" },
          { label: "Programs Deployed", value: "4" },
          { label: "Jurisdictions", value: "8" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-center"
          >
            <div className="text-2xl font-bold text-green-400">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Protocol programs */}
      <div className="mt-20">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Live on Solana Devnet
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              name: "Spore",
              desc: "IP Registration",
              id: "AZGNVbxsnUmCi9CoEDrosJXnTK6xmujbutJsLTqXQyPz",
            },
            {
              name: "Hypha",
              desc: "Licensing Engine",
              id: "9tB3hfhMfHxr6cPjikpPn8y9zVvXLFzEX7NDHAWYodj5",
            },
            {
              name: "Rhizome",
              desc: "Royalty Splits",
              id: "9HRqJ3toCnSBB3JQiMdCmoLg6qW5a6PdpwdHypRVBLNu",
            },
            {
              name: "Meridian",
              desc: "Evidence Engine",
              id: "7LrekmiYZDKPBsaSBVaXUVG9iXtB164XQ5ntRVeiMnfc",
            },
          ].map((prog) => (
            <a
              key={prog.name}
              href={`https://explorer.solana.com/address/${prog.id}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:border-green-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{prog.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {prog.desc}
                  </span>
                </div>
                <span className="text-green-400 text-xs">✓ Live</span>
              </div>
              <div className="font-mono text-xs text-gray-600 mt-1 truncate">
                {prog.id}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
