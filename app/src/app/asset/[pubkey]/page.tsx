"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_IDS } from "@/lib/constants";
import { shortenPubkey, formatDate, formatSlot, explorerUrl } from "@/lib/format";
import {
  IP_TYPE_LABELS,
  IP_TYPE_ICONS,
  IP_STATUS_LABELS,
  IP_STATUS_COLORS,
  IPTypeKey,
  IPStatusKey,
  bytesToHex,
  countryCodeToString,
} from "@/lib/types";

function parseAssetFromBuffer(data: Buffer) {
  try {
    let offset = 8; // skip discriminator

    const creator = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
    offset += 32;

    const contentHash = bytesToHex(Array.from(data.subarray(offset, offset + 32)));
    offset += 32;

    const perceptualHash = bytesToHex(Array.from(data.subarray(offset, offset + 32)));
    offset += 32;

    const ipTypeIndex = data.readUInt8(offset);
    offset += 1;
    const ipTypes: IPTypeKey[] = [
      "literaryWork", "visualArt", "music", "software", "characterIp",
      "meme", "video", "aiGenerated", "traditionalKnowledge", "dataset", "brandMark",
    ];
    const ipType = ipTypes[ipTypeIndex] || "literaryWork";

    const uriLen = data.readUInt32LE(offset);
    offset += 4;
    const metadataUri = data.subarray(offset, offset + uriLen).toString("utf-8");
    offset += uriLen;

    const registrationSlot = Number(data.readBigUInt64LE(offset));
    offset += 8;

    const registrationTimestamp = Number(data.readBigInt64LE(offset));
    offset += 8;

    const hasParent = data.readUInt8(offset);
    offset += 1;
    let parentIp: string | null = null;
    if (hasParent) {
      parentIp = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;
    }

    const statusIndex = data.readUInt8(offset);
    offset += 1;
    const statuses: IPStatusKey[] = ["active", "disputed", "suspended", "revoked"];
    const status = statuses[statusIndex] || "active";

    const licenseCount = data.readUInt32LE(offset);
    offset += 4;
    const disputeCount = data.readUInt32LE(offset);
    offset += 4;
    const version = data.readUInt16LE(offset);
    offset += 2;

    const hasNiceClass = data.readUInt8(offset);
    offset += 1;
    let niceClass: number | null = null;
    if (hasNiceClass) { niceClass = data.readUInt8(offset); offset += 1; }

    const hasBerne = data.readUInt8(offset);
    offset += 1;
    let berneCategory: number | null = null;
    if (hasBerne) { berneCategory = data.readUInt8(offset); offset += 1; }

    const countryOfOrigin = countryCodeToString(Array.from(data.subarray(offset, offset + 2)));
    offset += 2;

    const hasFirstUse = data.readUInt8(offset);
    offset += 1;
    if (hasFirstUse) offset += 8;

    const wipoAligned = data.readUInt8(offset) === 1;

    return {
      creator, contentHash, perceptualHash, ipType, metadataUri,
      registrationSlot, registrationTimestamp, parentIp, status,
      licenseCount, disputeCount, version, niceClass, berneCategory,
      countryOfOrigin, wipoAligned,
    };
  } catch {
    return null;
  }
}

export default function AssetDetailPage() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  const { connection } = useConnection();

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ["asset", pubkey],
    queryFn: async () => {
      const pk = new PublicKey(pubkey);
      const info = await connection.getAccountInfo(pk);
      if (!info) return null;
      return parseAssetFromBuffer(info.data as Buffer);
    },
    enabled: !!pubkey,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-2xl">⏳</div>
        <p className="text-gray-400 mt-2">Loading asset...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h1 className="text-xl font-bold mb-2">Asset Not Found</h1>
        <p className="text-gray-400 mb-4">
          This IP asset does not exist on-chain or hasn&apos;t been indexed yet.
        </p>
        <Link href="/assets" className="text-green-400 hover:underline">
          ← Back to My Assets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{IP_TYPE_ICONS[asset.ipType]}</span>
            <h1 className="text-3xl font-bold">
              {IP_TYPE_LABELS[asset.ipType]}
            </h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${IP_STATUS_COLORS[asset.status]}`}
            >
              {IP_STATUS_LABELS[asset.status]}
            </span>
          </div>
          <p className="text-gray-400 font-mono text-sm">{pubkey}</p>
        </div>
        <a
          href={explorerUrl(pubkey)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 border border-gray-600 rounded-lg text-sm text-gray-300 hover:border-green-500/50"
        >
          Explorer →
        </a>
      </div>

      {/* On-chain proof */}
      <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5 mb-6">
        <h2 className="font-semibold mb-4 text-green-400">
          🔒 On-Chain Proof of Existence
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Registered at Slot</span>
            <div className="font-mono">{formatSlot(asset.registrationSlot)}</div>
          </div>
          <div>
            <span className="text-gray-500">Timestamp</span>
            <div>{formatDate(asset.registrationTimestamp)}</div>
          </div>
          <div>
            <span className="text-gray-500">Creator</span>
            <div className="font-mono">
              <a href={explorerUrl(asset.creator)} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                {shortenPubkey(asset.creator, 8)}
              </a>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Version</span>
            <div>v{asset.version}</div>
          </div>
        </div>
      </div>

      {/* Hashes */}
      <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] mb-6">
        <h2 className="font-semibold mb-4">Cryptographic Fingerprints</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Content Hash (SHA-256)</span>
            <div className="font-mono text-xs break-all mt-1 bg-black/30 p-2 rounded">
              {asset.contentHash}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Perceptual Hash</span>
            <div className="font-mono text-xs break-all mt-1 bg-black/30 p-2 rounded">
              {asset.perceptualHash}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Metadata URI</span>
            <div className="font-mono text-xs break-all mt-1 bg-black/30 p-2 rounded">
              {asset.metadataUri}
            </div>
          </div>
        </div>
      </div>

      {/* WIPO Metadata */}
      <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] mb-6">
        <h2 className="font-semibold mb-4">WIPO-Compatible Metadata</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Country</span>
            <div className="text-lg">{asset.countryOfOrigin || "—"}</div>
          </div>
          <div>
            <span className="text-gray-500">Nice Class</span>
            <div className="text-lg">{asset.niceClass ?? "—"}</div>
          </div>
          <div>
            <span className="text-gray-500">Berne Category</span>
            <div className="text-lg">{asset.berneCategory ?? "—"}</div>
          </div>
          <div>
            <span className="text-gray-500">WIPO Aligned</span>
            <div className="text-lg">
              {asset.wipoAligned ? "✅ Yes" : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-center">
          <div className="text-2xl font-bold">{asset.licenseCount}</div>
          <div className="text-xs text-gray-500">Licenses</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-center">
          <div className="text-2xl font-bold">{asset.disputeCount}</div>
          <div className="text-xs text-gray-500">Disputes</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-center">
          <div className="text-2xl font-bold">
            {asset.parentIp ? "Yes" : "Original"}
          </div>
          <div className="text-xs text-gray-500">Derivative</div>
        </div>
      </div>

      {asset.parentIp && (
        <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-sm">
          <span className="text-gray-500">Parent IP: </span>
          <Link
            href={`/asset/${asset.parentIp}`}
            className="text-blue-400 hover:underline font-mono"
          >
            {shortenPubkey(asset.parentIp, 8)}
          </Link>
        </div>
      )}
    </div>
  );
}
