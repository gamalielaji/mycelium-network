"use client";

import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { findIPAssetPDA } from "@/lib/pda";
import { PROGRAM_IDS } from "@/lib/constants";
import { IPTypeKey } from "@/lib/types";

// Anchor instruction discriminator for register_ip
// SHA-256("global:register_ip")[0..8]
const REGISTER_IP_DISCRIMINATOR = Buffer.from([
  175, 73, 203, 183, 164, 131, 30, 113,
]);

interface RegisterParams {
  contentHash: Uint8Array;
  perceptualHash: Uint8Array;
  ipType: IPTypeKey;
  metadataUri: string;
  countryOfOrigin: string;
  niceClass?: number;
}

// Map IPType keys to their Anchor enum index
const IP_TYPE_INDEX: Record<IPTypeKey, number> = {
  literaryWork: 0,
  visualArt: 1,
  music: 2,
  software: 3,
  characterIp: 4,
  meme: 5,
  video: 6,
  aiGenerated: 7,
  traditionalKnowledge: 8,
  dataset: 9,
  brandMark: 10,
};

function encodeRegisterIpData(params: RegisterParams): Buffer {
  const uriBytes = Buffer.from(params.metadataUri, "utf-8");
  const countryBytes = Buffer.from(params.countryOfOrigin.slice(0, 2), "ascii");

  // Calculate buffer size
  const size =
    8 + // discriminator
    32 + // content_hash
    32 + // perceptual_hash
    1 + // ip_type enum index
    4 + uriBytes.length + // string (4-byte len + data)
    1 + (params.niceClass !== undefined ? 1 : 0) + // Option<u8>
    1 + // Option<u8> berne_category = None
    2 + // country_of_origin [u8;2]
    1; // Option<i64> first_use_date = None

  const buf = Buffer.alloc(size);
  let offset = 0;

  // Discriminator
  REGISTER_IP_DISCRIMINATOR.copy(buf, offset);
  offset += 8;

  // content_hash [u8;32]
  Buffer.from(params.contentHash).copy(buf, offset);
  offset += 32;

  // perceptual_hash [u8;32]
  Buffer.from(params.perceptualHash).copy(buf, offset);
  offset += 32;

  // ip_type (enum as single byte index)
  buf.writeUInt8(IP_TYPE_INDEX[params.ipType], offset);
  offset += 1;

  // metadata_uri (Borsh string: 4-byte LE length + UTF-8 bytes)
  buf.writeUInt32LE(uriBytes.length, offset);
  offset += 4;
  uriBytes.copy(buf, offset);
  offset += uriBytes.length;

  // nice_class: Option<u8>
  if (params.niceClass !== undefined) {
    buf.writeUInt8(1, offset); // Some
    offset += 1;
    buf.writeUInt8(params.niceClass, offset);
    offset += 1;
  } else {
    buf.writeUInt8(0, offset); // None
    offset += 1;
  }

  // berne_category: Option<u8> = None
  buf.writeUInt8(0, offset);
  offset += 1;

  // country_of_origin: [u8;2]
  countryBytes.copy(buf, offset);
  offset += 2;

  // first_use_date: Option<i64> = None
  buf.writeUInt8(0, offset);
  offset += 1;

  return buf.subarray(0, offset);
}

export function useRegisterIP() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [ipAssetPDA, setIpAssetPDA] = useState<string | null>(null);

  const register = useCallback(
    async (params: RegisterParams) => {
      if (!publicKey || !sendTransaction) {
        setError("Wallet not connected");
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);

      try {
        const [pda] = findIPAssetPDA(publicKey, params.contentHash);
        setIpAssetPDA(pda.toBase58());

        const data = encodeRegisterIpData(params);

        const { blockhash } = await connection.getLatestBlockhash();

        const instruction = {
          keys: [
            { pubkey: pda, isSigner: false, isWritable: true },
            { pubkey: publicKey, isSigner: true, isWritable: true },
            {
              pubkey: SystemProgram.programId,
              isSigner: false,
              isWritable: false,
            },
          ],
          programId: PROGRAM_IDS.spore,
          data,
        };

        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const tx = new VersionedTransaction(messageV0);
        const sig = await sendTransaction(tx, connection);

        await connection.confirmTransaction(sig, "confirmed");
        setTxSignature(sig);

        return { signature: sig, pda: pda.toBase58() };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, sendTransaction, connection]
  );

  return { register, isLoading, error, txSignature, ipAssetPDA };
}
