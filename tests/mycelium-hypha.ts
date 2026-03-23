import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyceliumHypha } from "../target/types/mycelium_hypha";
import { MyceliumSpore } from "../target/types/mycelium_spore";
import { expect } from "chai";
import { createHash } from "crypto";

describe("mycelium-hypha", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const hyphaProgram = anchor.workspace.MyceliumHypha as Program<MyceliumHypha>;
  const sporeProgram = anchor.workspace.MyceliumSpore as Program<MyceliumSpore>;
  const licensor = provider.wallet;

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

  function findLicenseTemplatePDA(ipAssetKey: anchor.web3.PublicKey, licensorKey: anchor.web3.PublicKey) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license_template"), ipAssetKey.toBuffer(), licensorKey.toBuffer()],
      hyphaProgram.programId
    );
  }

  function findLicensePDA(templateKey: anchor.web3.PublicKey, licenseeKey: anchor.web3.PublicKey) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license"), templateKey.toBuffer(), licenseeKey.toBuffer()],
      hyphaProgram.programId
    );
  }

  let ipAssetPDA: anchor.web3.PublicKey;

  before(async () => {
    const content = "Hai Dudu character IP — licensing test";
    const cHash = contentHash(content);
    const pHash = perceptualHash(content);
    [ipAssetPDA] = findIPAssetPDA(licensor.publicKey, cHash);

    await sporeProgram.methods
      .registerIp(cHash, pHash, { characterIp: {} }, "ar://hai_dudu", 25, null, [73, 68], null)
      .accounts({
        ipAsset: ipAssetPDA,
        creator: licensor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  describe("create_license_template", () => {
    it("creates a commercial license template", async () => {
      const [templatePDA] = findLicenseTemplatePDA(ipAssetPDA, licensor.publicKey);

      await hyphaProgram.methods
        .createLicenseTemplate(
          { commercial: {} },
          500,  // 5% royalty
          10,   // max 10 sublicenses
          { asean: {} },
          new anchor.BN(365 * 24 * 60 * 60), // 1 year
          true, // commercial use
          false // no AI training
        )
        .accounts({
          licenseTemplate: templatePDA,
          ipAsset: ipAssetPDA,
          licensor: licensor.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const template = await hyphaProgram.account.licenseTemplate.fetch(templatePDA);
      expect(template.ipAsset.toBase58()).to.equal(ipAssetPDA.toBase58());
      expect(template.royaltyRateBps).to.equal(500);
      expect(template.commercialUse).to.be.true;
      expect(template.aiTrainingAllowed).to.be.false;
      expect(template.isActive).to.be.true;
      expect(template.activeLicenses).to.equal(0);
    });
  });

  describe("issue_license", () => {
    it("issues a license to a brand partner", async () => {
      const [templatePDA] = findLicenseTemplatePDA(ipAssetPDA, licensor.publicKey);
      const licensee = anchor.web3.Keypair.generate();
      const [licensePDA] = findLicensePDA(templatePDA, licensee.publicKey);

      await hyphaProgram.methods
        .issueLicense("Unilever Indonesia", "Brand collaboration — Hai Dudu x product packaging")
        .accounts({
          license: licensePDA,
          licenseTemplate: templatePDA,
          licensee: licensee.publicKey,
          licensor: licensor.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const license = await hyphaProgram.account.license.fetch(licensePDA);
      expect(license.licensee.toBase58()).to.equal(licensee.publicKey.toBase58());
      expect(license.licenseeName).to.equal("Unilever Indonesia");
      expect(license.royaltyRateBps).to.equal(500);
      expect(license.status).to.deep.equal({ active: {} });

      const template = await hyphaProgram.account.licenseTemplate.fetch(templatePDA);
      expect(template.activeLicenses).to.equal(1);
      expect(template.totalIssued).to.equal(1);
    });
  });
});
