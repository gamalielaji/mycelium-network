import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyceliumSpore } from "../target/types/mycelium_spore";
import { expect } from "chai";
import { createHash } from "crypto";

describe("mycelium-spore", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MyceliumSpore as Program<MyceliumSpore>;
  const creator = provider.wallet;

  function contentHash(data: string): number[] {
    return Array.from(createHash("sha256").update(data).digest());
  }

  function perceptualHash(data: string): number[] {
    return Array.from(createHash("sha256").update("phash:" + data).digest());
  }

  function findIPAssetPDA(creatorKey: anchor.web3.PublicKey, hash: number[]) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("ip_asset"), creatorKey.toBuffer(), Buffer.from(hash)],
      program.programId
    );
  }

  describe("register_ip", () => {
    it("registers a new IP asset with WIPO metadata", async () => {
      const content = "Original artwork — Mycelium test registration";
      const cHash = contentHash(content);
      const pHash = perceptualHash(content);
      const metadataUri = "ar://abc123def456_test_metadata_v1";
      const [ipAssetPDA] = findIPAssetPDA(creator.publicKey, cHash);

      await program.methods
        .registerIp(
          cHash,
          pHash,
          { visualArt: {} },
          metadataUri,
          25,       // Nice class 25 (clothing)
          null,     // No Berne category
          [73, 68], // "ID" = Indonesia
          null      // No first use date
        )
        .accounts({
          ipAsset: ipAssetPDA,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const account = await program.account.ipAsset.fetch(ipAssetPDA);
      expect(account.creator.toBase58()).to.equal(creator.publicKey.toBase58());
      expect(Array.from(account.contentHash)).to.deep.equal(cHash);
      expect(account.metadataUri).to.equal(metadataUri);
      expect(account.status).to.deep.equal({ active: {} });
      expect(account.wipoAligned).to.be.true;
      expect(account.niceClass).to.equal(25);
      expect(Array.from(account.countryOfOrigin)).to.deep.equal([73, 68]);
      expect(account.version).to.equal(1);
    });

    it("rejects duplicate registration", async () => {
      const content = "Duplicate test content";
      const cHash = contentHash(content);
      const pHash = perceptualHash(content);
      const [ipAssetPDA] = findIPAssetPDA(creator.publicKey, cHash);

      await program.methods
        .registerIp(cHash, pHash, { music: {} }, "ar://first", null, null, [73, 68], null)
        .accounts({
          ipAsset: ipAssetPDA,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      try {
        await program.methods
          .registerIp(cHash, pHash, { music: {} }, "ar://duplicate", null, null, [73, 68], null)
          .accounts({
            ipAsset: ipAssetPDA,
            creator: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("already in use");
      }
    });

    it("rejects zero content hash", async () => {
      const zeroHash = new Array(32).fill(0);
      const pHash = perceptualHash("zero");
      const [ipAssetPDA] = findIPAssetPDA(creator.publicKey, zeroHash);

      try {
        await program.methods
          .registerIp(zeroHash, pHash, { software: {} }, "ar://valid", null, null, [73, 68], null)
          .accounts({
            ipAsset: ipAssetPDA,
            creator: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidContentHash");
      }
    });
  });

  describe("register_derivative", () => {
    let parentPDA: anchor.web3.PublicKey;

    before(async () => {
      const parentContent = "Parent character IP for derivative tests";
      const cHash = contentHash(parentContent);
      const pHash = perceptualHash(parentContent);
      [parentPDA] = findIPAssetPDA(creator.publicKey, cHash);

      await program.methods
        .registerIp(cHash, pHash, { characterIp: {} }, "ar://parent", null, null, [73, 68], null)
        .accounts({
          ipAsset: parentPDA,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });

    it("registers a derivative with parent link", async () => {
      const derivContent = "Fan art derivative";
      const cHash = contentHash(derivContent);
      const pHash = perceptualHash(derivContent);
      const [derivPDA] = findIPAssetPDA(creator.publicKey, cHash);

      await program.methods
        .registerDerivative(cHash, pHash, { visualArt: {} }, "ar://fanart", [73, 68])
        .accounts({
          ipAsset: derivPDA,
          parentIpAsset: parentPDA,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const account = await program.account.ipAsset.fetch(derivPDA);
      expect(account.parentIp.toBase58()).to.equal(parentPDA.toBase58());
    });
  });

  describe("transfer_ownership", () => {
    it("transfers with both signatures", async () => {
      const content = "Transferable IP";
      const cHash = contentHash(content);
      const pHash = perceptualHash(content);
      const [pda] = findIPAssetPDA(creator.publicKey, cHash);

      await program.methods
        .registerIp(cHash, pHash, { brandMark: {} }, "ar://brand", null, null, [73, 68], null)
        .accounts({
          ipAsset: pda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const newOwner = anchor.web3.Keypair.generate();
      const sig = await provider.connection.requestAirdrop(newOwner.publicKey, anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);

      await program.methods
        .transferOwnership()
        .accounts({
          ipAsset: pda,
          currentOwner: creator.publicKey,
          newOwner: newOwner.publicKey,
        })
        .signers([newOwner])
        .rpc();

      const account = await program.account.ipAsset.fetch(pda);
      expect(account.creator.toBase58()).to.equal(newOwner.publicKey.toBase58());
    });
  });

  describe("evidence chain verification", () => {
    it("produces a complete evidence chain", async () => {
      const content = "Court evidence test — Mycelium IP registration";
      const cHash = contentHash(content);
      const pHash = perceptualHash(content);
      const metadataUri = "ar://TxAbCdEf123_court_evidence";
      const [pda] = findIPAssetPDA(creator.publicKey, cHash);

      const tx = await program.methods
        .registerIp(cHash, pHash, { literaryWork: {} }, metadataUri, null, 1, [73, 68], null)
        .accounts({
          ipAsset: pda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const account = await program.account.ipAsset.fetch(pda);
      const accountInfo = await provider.connection.getAccountInfo(pda);

      expect(accountInfo).to.not.be.null;
      expect(accountInfo.owner.toBase58()).to.equal(program.programId.toBase58());
      expect(Array.from(account.contentHash)).to.deep.equal(cHash);
      expect(account.registrationSlot.toNumber()).to.be.greaterThan(0);
      expect(account.metadataUri).to.match(/^ar:\/\//);

      console.log("\n    === EVIDENCE PACKAGE ===");
      console.log(`    PDA: ${pda.toBase58()}`);
      console.log(`    Creator: ${account.creator.toBase58()}`);
      console.log(`    Hash: ${Buffer.from(account.contentHash).toString("hex")}`);
      console.log(`    Slot: ${account.registrationSlot.toString()}`);
      console.log(`    Time: ${new Date(account.registrationTimestamp.toNumber() * 1000).toISOString()}`);
      console.log(`    Tx: ${tx}`);
      console.log("    === END ===\n");
    });
  });
});
