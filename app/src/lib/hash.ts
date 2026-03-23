/**
 * Client-side SHA-256 hashing using Web Crypto API.
 * No Node.js crypto dependency — works in all browsers.
 */

export async function sha256(data: ArrayBuffer): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hash = await sha256(data);
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashFile(file: File): Promise<{
  contentHash: Uint8Array;
  contentHashHex: string;
  perceptualHash: Uint8Array;
  perceptualHashHex: string;
}> {
  const arrayBuffer = await file.arrayBuffer();

  // Content hash — SHA-256 of raw file bytes
  const contentHash = await sha256(arrayBuffer);
  const contentHashHex = Array.from(contentHash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Perceptual hash — for MVP, use SHA-256 with a salt prefix
  // In production, this would be pHash/dHash for images, Chromaprint for audio, etc.
  const saltedData = new Uint8Array([
    ...new TextEncoder().encode("mycelium_perceptual_v1:"),
    ...new Uint8Array(arrayBuffer),
  ]);
  const perceptualHash = await sha256(saltedData.buffer);
  const perceptualHashHex = Array.from(perceptualHash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { contentHash, contentHashHex, perceptualHash, perceptualHashHex };
}
