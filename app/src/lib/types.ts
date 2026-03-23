// Display types for the web app — derived from on-chain Anchor structs

export type IPTypeKey =
  | "literaryWork"
  | "visualArt"
  | "music"
  | "software"
  | "characterIp"
  | "meme"
  | "video"
  | "aiGenerated"
  | "traditionalKnowledge"
  | "dataset"
  | "brandMark";

export type IPStatusKey = "active" | "disputed" | "suspended" | "revoked";

export type LicenseTypeKey =
  | "creativeCommons"
  | "commercial"
  | "exclusive"
  | "aiTraining";

export type TerritoryKey = "global" | "country" | "asean" | "custom";

export type LicenseStatusKey = "active" | "expired" | "revoked" | "suspended";

// Labels for display
export const IP_TYPE_LABELS: Record<IPTypeKey, string> = {
  literaryWork: "Literary Work",
  visualArt: "Visual Art",
  music: "Music",
  software: "Software",
  characterIp: "Character IP",
  meme: "Meme",
  video: "Video",
  aiGenerated: "AI Generated",
  traditionalKnowledge: "Traditional Knowledge",
  dataset: "Dataset",
  brandMark: "Brand Mark",
};

export const IP_STATUS_LABELS: Record<IPStatusKey, string> = {
  active: "Active",
  disputed: "Disputed",
  suspended: "Suspended",
  revoked: "Revoked",
};

export const IP_STATUS_COLORS: Record<IPStatusKey, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  disputed: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  suspended: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  revoked: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const IP_TYPE_ICONS: Record<IPTypeKey, string> = {
  literaryWork: "📝",
  visualArt: "🎨",
  music: "🎵",
  software: "💻",
  characterIp: "🎭",
  meme: "😂",
  video: "🎬",
  aiGenerated: "🤖",
  traditionalKnowledge: "🌿",
  dataset: "📊",
  brandMark: "™️",
};

export const LICENSE_TYPE_LABELS: Record<LicenseTypeKey, string> = {
  creativeCommons: "Creative Commons",
  commercial: "Commercial",
  exclusive: "Exclusive",
  aiTraining: "AI Training",
};

// Display interfaces
export interface DisplayIPAsset {
  pubkey: string;
  creator: string;
  contentHash: string;
  perceptualHash: string;
  ipType: IPTypeKey;
  metadataUri: string;
  registrationSlot: number;
  registrationTimestamp: Date;
  parentIp: string | null;
  status: IPStatusKey;
  licenseCount: number;
  disputeCount: number;
  version: number;
  niceClass: number | null;
  berneCategory: number | null;
  countryOfOrigin: string;
  wipoAligned: boolean;
}

export interface DisplayLicenseTemplate {
  pubkey: string;
  ipAsset: string;
  licensor: string;
  licenseType: LicenseTypeKey;
  royaltyRateBps: number;
  maxSublicenses: number;
  territory: TerritoryKey;
  durationSeconds: number | null;
  commercialUse: boolean;
  aiTrainingAllowed: boolean;
  activeLicenses: number;
  totalIssued: number;
  isActive: boolean;
  createdAt: Date;
}

export interface DisplayLicense {
  pubkey: string;
  template: string;
  ipAsset: string;
  licensor: string;
  licensee: string;
  licenseeName: string;
  purpose: string;
  licenseType: LicenseTypeKey;
  royaltyRateBps: number;
  commercialUse: boolean;
  aiTrainingAllowed: boolean;
  issuedAt: Date;
  expiresAt: Date | null;
  status: LicenseStatusKey;
  totalRoyaltiesPaid: number;
}

// Anchor enum helper — extracts key from { variantName: {} } shape
export function extractEnumKey<T extends string>(
  enumObj: Record<string, unknown>
): T {
  return Object.keys(enumObj)[0] as T;
}

// Convert number[] (on-chain [u8;32]) to hex string
export function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Convert [u8;2] country code to string
export function countryCodeToString(bytes: number[]): string {
  return String.fromCharCode(bytes[0], bytes[1]);
}

// Build Anchor enum argument from key
export function toAnchorEnum(key: string): Record<string, Record<string, never>> {
  return { [key]: {} };
}

// IP Type options for select dropdowns
export const IP_TYPE_OPTIONS = Object.entries(IP_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as IPTypeKey, label, icon: IP_TYPE_ICONS[value as IPTypeKey] })
);
