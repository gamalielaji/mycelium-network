"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PROGRAM_IDS } from "@/lib/constants";
import {
  DisplayIPAsset,
  IPTypeKey,
  IPStatusKey,
  extractEnumKey,
  bytesToHex,
  countryCodeToString,
} from "@/lib/types";
import bs58 from "bs58";

function parseIPAsset(
  pubkey: string,
  data: Buffer
): DisplayIPAsset | null {
  try {
    // Skip 8-byte discriminator
    let offset = 8;

    // creator: Pubkey (32 bytes)
    const creator = bs58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    // content_hash: [u8;32]
    const contentHash = bytesToHex(Array.from(data.subarray(offset, offset + 32)));
    offset += 32;

    // perceptual_hash: [u8;32]
    const perceptualHash = bytesToHex(Array.from(data.subarray(offset, offset + 32)));
    offset += 32;

    // ip_type: enum (1 byte index)
    const ipTypeIndex = data.readUInt8(offset);
    offset += 1;
    const ipTypes: IPTypeKey[] = [
      "literaryWork", "visualArt", "music", "software", "characterIp",
      "meme", "video", "aiGenerated", "traditionalKnowledge", "dataset", "brandMark",
    ];
    const ipType = ipTypes[ipTypeIndex] || "literaryWork";

    // metadata_uri: String (4-byte len + UTF-8)
    const uriLen = data.readUInt32LE(offset);
    offset += 4;
    const metadataUri = data.subarray(offset, offset + uriLen).toString("utf-8");
    offset += uriLen;

    // registration_slot: u64
    const registrationSlot = Number(data.readBigUInt64LE(offset));
    offset += 8;

    // registration_timestamp: i64
    const registrationTimestamp = new Date(
      Number(data.readBigInt64LE(offset)) * 1000
    );
    offset += 8;

    // parent_ip: Option<Pubkey>
    const hasParent = data.readUInt8(offset);
    offset += 1;
    let parentIp: string | null = null;
    if (hasParent) {
      parentIp = bs58.encode(data.subarray(offset, offset + 32));
      offset += 32;
    }

    // status: enum (1 byte)
    const statusIndex = data.readUInt8(offset);
    offset += 1;
    const statuses: IPStatusKey[] = ["active", "disputed", "suspended", "revoked"];
    const status = statuses[statusIndex] || "active";

    // license_count: u32
    const licenseCount = data.readUInt32LE(offset);
    offset += 4;

    // dispute_count: u32
    const disputeCount = data.readUInt32LE(offset);
    offset += 4;

    // version: u16
    const version = data.readUInt16LE(offset);
    offset += 2;

    // nice_class: Option<u8>
    const hasNiceClass = data.readUInt8(offset);
    offset += 1;
    let niceClass: number | null = null;
    if (hasNiceClass) {
      niceClass = data.readUInt8(offset);
      offset += 1;
    }

    // berne_category: Option<u8>
    const hasBerne = data.readUInt8(offset);
    offset += 1;
    let berneCategory: number | null = null;
    if (hasBerne) {
      berneCategory = data.readUInt8(offset);
      offset += 1;
    }

    // country_of_origin: [u8;2]
    const countryOfOrigin = countryCodeToString(
      Array.from(data.subarray(offset, offset + 2))
    );
    offset += 2;

    // first_use_date: Option<i64> — skip
    const hasFirstUse = data.readUInt8(offset);
    offset += 1;
    if (hasFirstUse) offset += 8;

    // wipo_aligned: bool
    const wipoAligned = data.readUInt8(offset) === 1;

    return {
      pubkey,
      creator,
      contentHash,
      perceptualHash,
      ipType,
      metadataUri,
      registrationSlot,
      registrationTimestamp,
      parentIp,
      status,
      licenseCount,
      disputeCount,
      version,
      niceClass,
      berneCategory,
      countryOfOrigin,
      wipoAligned,
    };
  } catch {
    return null;
  }
}

export function useMyAssets() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["my-assets", publicKey?.toBase58()],
    queryFn: async (): Promise<DisplayIPAsset[]> => {
      if (!publicKey) return [];

      const accounts = await connection.getProgramAccounts(PROGRAM_IDS.spore, {
        filters: [
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ],
      });

      return accounts
        .map((acc) =>
          parseIPAsset(acc.pubkey.toBase58(), acc.account.data as Buffer)
        )
        .filter((a): a is DisplayIPAsset => a !== null)
        .sort(
          (a, b) =>
            b.registrationTimestamp.getTime() - a.registrationTimestamp.getTime()
        );
    },
    enabled: !!publicKey,
    refetchInterval: 30_000,
  });
}
