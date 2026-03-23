"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRegisterIP } from "@/hooks/use-register-ip";
import { hashFile } from "@/lib/hash";
import { txExplorerUrl, explorerUrl, formatFileSize } from "@/lib/format";
import { IP_TYPE_OPTIONS, IPTypeKey } from "@/lib/types";

export default function RegisterPage() {
  const { connected } = useWallet();
  const { register, isLoading, error, txSignature, ipAssetPDA } = useRegisterIP();

  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{
    contentHash: Uint8Array;
    contentHashHex: string;
    perceptualHash: Uint8Array;
    perceptualHashHex: string;
  } | null>(null);
  const [ipType, setIpType] = useState<IPTypeKey>("visualArt");
  const [metadataUri, setMetadataUri] = useState("");
  const [countryCode, setCountryCode] = useState("ID");
  const [isHashing, setIsHashing] = useState(false);

  const handleFileDrop = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setIsHashing(true);
    try {
      const result = await hashFile(f);
      setHashes(result);
      if (!metadataUri) {
        setMetadataUri(`ipfs://placeholder/${f.name}`);
      }
    } finally {
      setIsHashing(false);
    }
  }, [metadataUri]);

  const handleRegister = async () => {
    if (!hashes) return;

    await register({
      contentHash: hashes.contentHash,
      perceptualHash: hashes.perceptualHash,
      ipType,
      metadataUri: metadataUri || `ipfs://placeholder/${file?.name || "content"}`,
      countryOfOrigin: countryCode,
    });
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
        <p className="text-gray-400">Connect your Solana wallet to register IP.</p>
      </div>
    );
  }

  // Success state
  if (txSignature && ipAssetPDA) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="p-8 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">IP Registered on Solana</h1>
          <p className="text-gray-400 mb-6">
            Your intellectual property now has cryptographic proof of existence.
          </p>

          <div className="space-y-3 text-left bg-black/30 rounded-lg p-4 font-mono text-sm">
            <div>
              <span className="text-gray-500">PDA: </span>
              <a
                href={explorerUrl(ipAssetPDA)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline break-all"
              >
                {ipAssetPDA}
              </a>
            </div>
            <div>
              <span className="text-gray-500">TX: </span>
              <a
                href={txExplorerUrl(txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline break-all"
              >
                {txSignature}
              </a>
            </div>
            <div>
              <span className="text-gray-500">Hash: </span>
              <span className="text-gray-300 break-all">
                {hashes?.contentHashHex}
              </span>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <a
              href={txExplorerUrl(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg text-sm"
            >
              View on Explorer →
            </a>
            <button
              onClick={() => {
                setFile(null);
                setHashes(null);
                window.location.reload();
              }}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm hover:border-gray-400"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Register IP</h1>
      <p className="text-gray-400 mb-8">
        Hash your content and register proof of existence on Solana.
      </p>

      <div className="space-y-6">
        {/* Step 1: File */}
        <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <h2 className="font-semibold">Select Content</h2>
          </div>

          <label className="block border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-green-500/50 transition-colors">
            <input
              type="file"
              className="hidden"
              onChange={handleFileDrop}
              disabled={isHashing}
            />
            {file ? (
              <div>
                <div className="text-2xl mb-2">📄</div>
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">📁</div>
                <div className="text-gray-400">
                  Drop a file or click to select
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Any file type — image, audio, video, document, code
                </div>
              </div>
            )}
          </label>

          {isHashing && (
            <div className="mt-3 text-sm text-yellow-400 animate-pulse">
              ⏳ Computing SHA-256 hash...
            </div>
          )}

          {hashes && (
            <div className="mt-3 p-3 bg-black/30 rounded-lg font-mono text-xs space-y-1">
              <div>
                <span className="text-gray-500">SHA-256: </span>
                <span className="text-green-400 break-all">
                  {hashes.contentHashHex}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Perceptual: </span>
                <span className="text-gray-400 break-all">
                  {hashes.perceptualHashHex.slice(0, 16)}...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: IP Type */}
        <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <h2 className="font-semibold">IP Type & Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                IP Type
              </label>
              <select
                value={ipType}
                onChange={(e) => setIpType(e.target.value as IPTypeKey)}
                className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {IP_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Country of Origin
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) =>
                  setCountryCode(e.target.value.toUpperCase().slice(0, 2))
                }
                maxLength={2}
                placeholder="ID"
                className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-1">
              Metadata URI
            </label>
            <input
              type="text"
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              placeholder="ipfs://... or arweave://..."
              className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-gray-600 mt-1">
              Link to full metadata (Arweave/IPFS). Placeholder OK for testing.
            </p>
          </div>
        </div>

        {/* Step 3: Register */}
        <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <h2 className="font-semibold">Register on Solana</h2>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            This creates an IPAsset PDA with your content hash anchored to
            Solana&apos;s Proof of History. Cost: ~0.004 SOL.
          </p>

          <button
            onClick={handleRegister}
            disabled={!hashes || isLoading || !metadataUri}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold rounded-lg transition-colors"
          >
            {isLoading ? "⏳ Signing Transaction..." : "Register IP →"}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
