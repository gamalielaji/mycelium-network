import { PublicKey } from "@solana/web3.js";
import { PROGRAM_IDS, SEEDS } from "./constants";

export function findIPAssetPDA(
  creator: PublicKey,
  contentHash: Uint8Array
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.IP_ASSET, creator.toBuffer(), contentHash],
    PROGRAM_IDS.spore
  );
}

export function findLicenseTemplatePDA(
  ipAsset: PublicKey,
  licensor: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.LICENSE_TEMPLATE, ipAsset.toBuffer(), licensor.toBuffer()],
    PROGRAM_IDS.hypha
  );
}

export function findLicensePDA(
  template: PublicKey,
  licensee: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.LICENSE, template.toBuffer(), licensee.toBuffer()],
    PROGRAM_IDS.hypha
  );
}

export function findRoyaltyConfigPDA(
  ipAsset: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.ROYALTY_CONFIG, ipAsset.toBuffer()],
    PROGRAM_IDS.rhizome
  );
}

export function findEvidencePDA(
  ipAsset: PublicKey,
  requester: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.EVIDENCE, ipAsset.toBuffer(), requester.toBuffer()],
    PROGRAM_IDS.meridian
  );
}
