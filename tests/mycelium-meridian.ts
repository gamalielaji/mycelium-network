import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyceliumMeridian } from "../target/types/mycelium_meridian";
import { MyceliumSpore } from "../target/types/mycelium_spore";
import { expect } from "chai";
import { createHash } from "crypto";

describe("mycelium-meridian", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const meridianProgram = anchor.workspace.MyceliumMeridian as Program<MyceliumMeridian>;
  const sporeProgram = anchor.workspace.MyceliumSpore as Program<MyceliumSpore>;
  const requester = provider.wallet;

  function contentHash(data: string): number[] {
    return Array.from(createHash("sha256").update(data).digest());
  }

  function perceptualHash(data: string): number[] {
    return Array.from(createHash("sha256").update("phash:" + data).digest());
  }

  function findIPAssetPDA(creatorKey: anchor.web3.PublicKey, hash: number[]) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("ip_asset"), creatorKey.toBuffer(), Buffer.from(hash)],
      sporeProgram.programId
    );
  }

  function findEvidencePDA(ipAssetKey: anchor.web3.PublicKey, requesterKey: anchor.web3.PublicKey) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("evidence"), ipAssetKey.toBuffer(), requesterKey.toBuffer()],
      meridianProgram.programId
    );
  }

  let ipAssetPDA: anchor.web3.PublicKey;

  before(async () => {
    const content = "Tahilalats character — MEP test";
    const cHash = contentHash(content);
    const pHash = perceptualHash(content);
    [ipAssetPDA] = findIPAssetPDA(requester.publicKey, cHash);

    await sporeProgram.methods
      .registerIp(cHash, pHash, { characterIp: {} }, "ar://tahilalats", 25, null, [73, 68], null)
      .accounts({
        ipAsset: ipAssetPDA,
        creator: requester.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  describe("generate_mep", () => {
    it("generates a WIPO evidence package for Indonesian jurisdiction", async () => {
      const mepContent = JSON.stringify({
        ip_asset: ipAssetPDA.toBase58(),
        jurisdiction: "Indonesia",
        generated: new Date().toISOString(),
      });
      const packageHash = Array.from(createHash("sha256").update(mepContent).digest());
      const fakeSignature = new Array(64).fill(1); // Placeholder Ed25519 sig
      const [evidencePDA] = findEvidencePDA(ipAssetPDA, requester.publicKey);

      await meridianProgram.methods
        .generateMep(
          packageHash,
          "ar://mep_tahilalats_indonesia_v1",
          fakeSignature,
          3,                     // 3 active licenses
          new anchor.BN(50000),  // 50,000 lamports total royalties
          { indonesia: {} }
        )
        .accounts({
          evidencePackage: evidencePDA,
          ipAsset: ipAssetPDA,
          requester: requester.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const evidence = await meridianProgram.account.evidencePackage.fetch(evidencePDA);
      expect(evidence.ipAsset.toBase58()).to.equal(ipAssetPDA.toBase58());
      expect(evidence.isWipoCompliant).to.be.true;
      expect(evidence.jurisdiction).to.deep.equal({ indonesia: {} });
      expect(evidence.licenseCountSnapshot).to.equal(3);
      expect(evidence.version).to.equal(1);
      expect(evidence.verificationCount).to.equal(0);

      console.log("\n    === MYCELIUM EVIDENCE PACKAGE ===");
      console.log(`    Evidence PDA: ${evidencePDA.toBase58()}`);
      console.log(`    IP Asset: ${evidence.ipAsset.toBase58()}`);
      console.log(`    Arweave URI: ${evidence.arweaveUri}`);
      console.log(`    Jurisdiction: Indonesia`);
      console.log(`    WIPO Compliant: ${evidence.isWipoCompliant}`);
      console.log(`    Licenses: ${evidence.licenseCountSnapshot}`);
      console.log(`    Generated: ${new Date(evidence.generatedAt.toNumber() * 1000).toISOString()}`);
      console.log("    === END MEP ===\n");
    });
  });

  describe("verify_mep", () => {
    it("verifies a valid MEP hash", async () => {
      const [evidencePDA] = findEvidencePDA(ipAssetPDA, requester.publicKey);
      const evidence = await meridianProgram.account.evidencePackage.fetch(evidencePDA);

      await meridianProgram.methods
        .verifyMep(Array.from(evidence.packageHash))
        .accounts({
          evidencePackage: evidencePDA,
          verifier: requester.publicKey,
        })
        .rpc();

      const updated = await meridianProgram.account.evidencePackage.fetch(evidencePDA);
      expect(updated.verificationCount).to.equal(1);
    });

    it("increments verification count on each verify", async () => {
      const [evidencePDA] = findEvidencePDA(ipAssetPDA, requester.publicKey);
      const evidence = await meridianProgram.account.evidencePackage.fetch(evidencePDA);

      // Verify with wrong hash — still increments counter, event emits is_valid: false
      const fakeHash = new Array(32).fill(255);
      await meridianProgram.methods
        .verifyMep(fakeHash)
        .accounts({
          evidencePackage: evidencePDA,
          verifier: requester.publicKey,
        })
        .rpc();

      const updated = await meridianProgram.account.evidencePackage.fetch(evidencePDA);
      expect(updated.verificationCount).to.equal(2);
    });
  });
});
