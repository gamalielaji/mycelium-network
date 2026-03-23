import { EXPLORER_URL, TX_EXPLORER_URL } from "./constants";

export function shortenPubkey(pubkey: string, chars = 4): string {
  return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}

export function formatDate(timestamp: number | Date): string {
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : timestamp;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSlot(slot: number): string {
  return slot.toLocaleString();
}

export function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function bpsToPercent(bps: number): string {
  return (bps / 100).toFixed(2) + "%";
}

export function explorerUrl(address: string): string {
  return EXPLORER_URL.replace("{address}", address);
}

export function txExplorerUrl(sig: string): string {
  return TX_EXPLORER_URL.replace("{sig}", sig);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
