# Mycelium Network

**IP Infrastructure for the Creator Economy. Built on Solana.**

The on-chain layer that completes WIPO — not competes with it. Instant IP timestamping, programmable licensing, automated royalty distribution, and court-ready evidence packages.

No token. No speculation. Pure infrastructure.

## Architecture

Four Anchor programs, one protocol:

| Program | Name | Purpose |
|---------|------|---------|
| `mycelium-spore` | **Spore** | IP Registration & Proof of Existence |
| `mycelium-hypha` | **Hypha** | Programmable IP Licensing |
| `mycelium-rhizome` | **Rhizome** | Royalty Distribution Engine |
| `mycelium-meridian` | **Meridian** | WIPO Evidence Module |

### Spore — IP Registry

Register any creative work on-chain with immutable SHA-256 content hash, perceptual hash for similarity detection, Arweave metadata URI, and WIPO-compatible fields (Nice Classification, Berne category, country of origin).

**PDA:** `["ip_asset", creator_pubkey, content_hash]`

Supported IP types: Literary Work, Visual Art, Music, Software, Character IP, Meme, Video, AI-Generated, Traditional Knowledge, Dataset, Brand Mark.

### Hypha — Licensing

Machine-readable license terms set by the creator. Four archetypes: Creative Commons, Commercial, Exclusive, AI Training. Configurable territory, duration, royalty rate, sublicensing rights.

### Rhizome — Royalties

Accept revenue deposits, automatically distribute to up to 8 recipients in a single atomic transaction. Configurable splits (basis points), platform fee, co-creator support.

### Meridian — WIPO Evidence

Generates the **Mycelium Evidence Package (MEP)** — a standardized dossier from any registered IP asset formatted for:

- **Indonesia** — UU ITE Pasal 5, Commercial Court (Pengadilan Niaga)
- **Kenya** — Evidence Act Section 106B, High Court
- **Colombia** — Ley 527, CGP Artículo 247, SIC
- **WIPO** — Arbitration and Mediation Center

MEP contents: blockchain registration proof, content authentication, creator identity, WIPO metadata, license history, commercial activity records, protocol signature, verification instructions.

## Quick Start

```bash
# Prerequisites: Rust, Solana CLI, Anchor CLI, Node.js

# Install dependencies
npm install

# Build all programs
anchor build

# Run tests (requires local validator or devnet)
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Project Structure

```
mycelium-network/
├── programs/
│   ├── mycelium-spore/      # IP Registration
│   ├── mycelium-hypha/      # Licensing
│   ├── mycelium-rhizome/    # Royalty Distribution
│   └── mycelium-meridian/   # WIPO Evidence
├── tests/                    # Integration tests
├── app/                      # Frontend (Next.js — TBD)
├── docs/                     # Documentation
│   ├── Mycelium_Legal_Integration_Playbook.md
│   └── litepaper, pitch, poc-spec (.docx)
├── Anchor.toml
├── Cargo.toml
└── package.json
```

## Core Flow

```
Creator → hash content (SHA-256) → upload to Arweave → register_ip on Spore
       → create_license_template on Hypha → issue_license to brand
       → configure_royalty on Rhizome → deposit_royalty → auto-distribute
       → generate_mep on Meridian → court-ready evidence package
```

## Why Solana

- **400ms finality** — IP timestamp precision
- **$0.00025/tx** — microroyalties viable
- **65,000 TPS** — high-volume content registration
- **PoH** — cryptographic timestamps accepted as evidence (Marseille precedent, March 2025)

## Anchored by INFIA Group

INFIA Group (120M+ audience, 36+ IPs) is the founding anchor partner. Day 1 IP: Hai Dudu, Tahilalats, Dagelan, Mindblowon. No cold-start problem.

## Legal Framework

Mycelium evidence packages are designed for admissibility in:

- **Indonesia**: UU ITE Pasal 5 (electronic evidence), Putusan MK No. 20/PUU-XIV/2016
- **Kenya**: Evidence Act Section 106B, Computer Misuse Act Section 52
- **Colombia**: Ley 527 (electronic commerce), CGP Artículo 247
- **WIPO**: Aligned with Task No. 59 blockchain standard development

See `docs/Mycelium_Legal_Integration_Playbook.md` for the full legal strategy.

## License

MIT

## Contact

Aji Pratomo — INFIA Group — [@memejunkies](https://twitter.com/memejunkies)

---

*Register everywhere. Enforce anywhere.*
