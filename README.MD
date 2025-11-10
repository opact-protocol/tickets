# Opact Tickets

Opact Tickets is a compliance-first zero-knowledge transaction mixer for the NEAR blockchain. It combines zkSNARK circuits, on-chain registry and instance contracts, and off-chain automation to deliver privacy for honest users while integrating [hapi.one](https://hapi.one/) risk scores to deter illicit finance.

The project is a Yarn workspaces monorepo that ships the entire stack required to run HideYourCash (HYC): zk circuits, reusable contract libraries, production contracts, relayer and denylist Cloudflare Workers, a React front end, an SDK, subgraph indexers, and end-to-end tooling.

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
  - [Actors and Data Flow](#actors-and-data-flow)
  - [Compliance Mechanics](#compliance-mechanics)
- [Monorepo Layout](#monorepo-layout)
- [Development Environment](#development-environment)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
  - [Core Build Steps](#core-build-steps)
- [Package Guides](#package-guides)
  - [Circuits (`packages/circuits`)](#circuits-packagescircuits)
  - [Contract Libraries (`packages/contract-libraries`)](#contract-libraries-packagescontract-libraries)
  - [Smart Contracts (`packages/contracts`)](#smart-contracts-packagescontracts)
  - [SDK (`packages/sdk`)](#sdk-packagessdk)
  - [Frontend (`packages/front`)](#frontend-packagesfront)
  - [Relayer (`packages/relayer`)](#relayer-packagesrelayer)
  - [Denylist Bot (`packages/denylist-bot`)](#denylist-bot-packagesdenylist-bot)
  - [Subgraph (`packages/subgraph`)](#subgraph-packagessubgraph)
  - [Testing Suites](#testing-suites)
- [Configuration Reference](#configuration-reference)
- [CI / CD](#ci--cd)
- [Resources](#resources)

## Overview
- **Problem**: Traditional mixers provide privacy but ignore regulatory requirements. Opact Tickets keeps honest users private while blocking wallets with elevated AML risk.
- **Approach**: zkSNARK commitments mask user identities and transaction links. A registry contract, instance contracts, and relayer enforce consistent flows. Integration with hapi.one ensures allowlist/denylist enforcement can happen on-chain and through automation.
- **Deliverables**: Production-ready contracts, relayer automation, privacy-preserving frontend, developer SDK, data indexers, and bots necessary to run a compliant mixer in production.

## System Architecture

### Actors and Data Flow
1. **User / Wallet**
   - Requests allowlist inclusion through the registry contract.
   - Creates deposit commitments and submits proofs for withdrawals.
2. **Registry Contract**
   - Stores allowlist/denylist Merkle roots and risk thresholds.
   - Maps supported currencies and fixed deposit amounts to specific instance contracts.
3. **Instance Contracts**
   - Hold user deposits (NEAR or NEP-141 tokens) at fixed denominations.
   - Verify PLONK proofs to release funds, manage nullifiers to prevent double spends.
4. **zkSNARK Circuits**
   - Provide the cryptographic logic for deposit commitments and compliant withdrawals.
5. **Relayer Service**
   - Cloudflare Worker that accepts signed withdrawal payloads, relays them on-chain, and charges configurable fees/storage reimbursements.
6. **Denylist Bot**
   - Cloudflare Worker with Durable Objects, Cron, and Queues.
   - Periodically re-scores accounts via hapi.one using subgraph data, triggering on-chain `denylist` calls when risk exceeds thresholds.
7. **Frontend**
   - React application using the SDK for Merkle tree management, proof generation, wallet flows, and relayer integration.
8. **SDK**
   - TypeScript library exposing composable actions, data fetching utilities, and proof helpers used by both the frontend and external integrators.
9. **Subgraph**
   - The Graph indexer that surfaces registry state, Merkle updates, commitments, and withdrawals for analytics, bots, and clients.

### Component Responsibilities
- **On-chain control plane**
  - `registry` contract is the single source of truth for AML thresholds, allowlist/denylist Merkle roots, and the mapping from `(currency, denomination)` pairs to mixer instances.
  - `instance` contracts maintain commitment Merkle trees, enforce nullifier uniqueness, charge protocol fees, and release funds on valid withdrawals.
- **Off-chain execution plane**
  - Circuits and proving keys define the cryptographic rules clients must satisfy. They are consumed by the frontend, SDK, and relayer.
  - The relayer and denylist Workers translate user proofs and compliance automation into on-chain transactions, insulating users from NEAR gas/storage complexity.
- **Data & observability**
  - The subgraph captures registry and instance events, providing historic state needed for clients, bots, and analytics.
  - Frontend/SKD maintain local Merkle caches synced from the subgraph to minimize RPC calls and speed up proof generation.

### Data Structures & State
- **Commitment Merkle Tree**: Stored in each instance contract, representing all deposits. Withdrawal proofs reference a recent root to ensure the commitment existed.
- **Allowlist Merkle Tree**: Stored on the registry contract. Users must prove membership during withdrawals, guaranteeing only low-risk accounts benefit from anonymity.
- **Nullifier Set**: Each instance tracks spent nullifiers to prevent double withdrawals.
- **Risk Parameters**: Categorized thresholds (e.g., sanctions, mixer usage) configured during registry initialization and upgradable via governance decisions.

### Operational Sequences
1. **Allowlist enrollment**
   - User signs into the frontend, which calls the registry’s `allowlist` method.
   - Registry queries hapi.one via cross-contract call to validate risk; on success, the allowlist Merkle tree updates and a new root is emitted.
2. **Deposit**
   - User creates a random secret/nullifier pair, generates a commitment via the SDK, and submits it to an instance contract alongside the fixed token amount.
   - Instance records the commitment in the Merkle tree and emits an event consumed by the subgraph.
3. **Withdrawal**
   - After sufficient mixing time, the user (or relayer) downloads the latest commitment and allowlist roots, generates a PLONK proof, and submits it to the relayer or directly on-chain.
   - Contract verifies the proof, checks the nullifier is unused, applies fees/refunds, and transfers funds to the recipient.
4. **Ongoing compliance**
   - Denylist bot monitors subgraph updates, rechecks risk scores through hapi.one, and invokes `denylist` to freeze accounts if thresholds are exceeded.
   - Relayer respects registry allowlist roots to refuse proofs built on stale or invalid compliance state.

### Compliance Mechanics
- **Allowlisting**: Users call `allowlist` on the registry. The contract queries hapi.one, compares the risk score with configured category thresholds, and includes compliant users in the Merkle tree.
- **Deposits**: Only allowlisted users can deposit into an instance. Commitments are recorded in the contract, creating anonymity sets.
- **Monitoring**: The denylist bot and manual operators can re-score any wallet via `denylist`. Elevated risk removes the wallet from allowlist eligibility and freezes outstanding deposits.
- **Withdrawals**: Proofs reference both the commitment tree (anonymity) and the allowlist tree (compliance). The relayer injects fees/refunds while ensuring the proof is valid and roots are recent.
- **Game Theory**: Malicious actors must withdraw quickly (poor anonymity) or risk being denylisted and losing funds, aligning incentives toward compliant use.

### Mixing & Anonymity Sets
- **Fixed-denomination pools**: Each instance contract corresponds to a single `(currency, amount)` pair. For example, one instance might accept only 10 NEAR deposits. Deposits that share denomination become indistinguishable once mixed.
- **Commitment creation**: Deposit commitments are hashes of a random secret and a nullifier. The commitment is the only value stored on-chain, so observers cannot link it to the originating account.
- **Anonymity set definition**: The effective anonymity set for a withdrawal is the count of *eligible* commitments in the instance’s Merkle tree that:
  - Were created before the withdrawal nullifier existed.
  - Have not been withdrawn (i.e., their nullifier is still unused).
  - Belong to allowlisted accounts at the time of withdrawal (enforced via the allowlist Merkle root).
- **Waiting period**: Users are encouraged to wait until a large number of other deposits join the pool. The frontend surfaces pool statistics (via subgraph data) so users can see the current anonymity set size before withdrawing.
- **Proof contents**: The withdrawal PLONK proof demonstrates simultaneously that:
  - The user knows a secret/nullifier pair that hashes to a commitment inside the Merkle tree.
  - The commitment has not been spent (nullifier absent from the nullifier set).
  - The withdrawing party is still allowlisted by referencing the latest allowlist Merkle root.
  - The public values (recipient, relayer, fee) respect protocol limits.
- **Link hiding**: Because withdrawals only reveal the recipient address, the relayer fee, and a new nullifier hash, on-chain observers cannot determine which commitment was used. The nullifier prevents double spending without exposing the original depositor.
- **Cross-pool behavior**: Users can split funds across multiple pools (e.g., 10 NEAR + 1 NEAR) to represent arbitrary balances. Each pool maintains its own anonymity set and Merkle tree.

## User Experience & Flows

### Onboarding & Allowlist Request
1. User connects a NEAR-compatible wallet in the frontend.
2. Frontend prompts for allowlist enrollment; the SDK prepares the `allowlist` transaction targeting the registry.
3. Registry queries hapi.one; on approval, the user appears in the allowlist tree. The frontend stores the resulting tree leaf and proof path for later use.

### Funding & Deposit
1. User chooses a supported pool (currency + denomination) provided by the registry view methods.
2. SDK generates a new commitment: random secret + nullifier, hashed with MiMC.
3. If using NEAR: the wallet signs a deposit transaction with the exact denomination attached. If using a NEP-141 token: the frontend wraps the commitment in the `ft_transfer_call` payload.
4. Instance contract inserts the commitment and emits Merkle update events; the frontend confirms inclusion via the subgraph before clearing local state.

### Delayed Withdraw via Relayer
1. User waits until the anonymity set threshold (e.g., number of deposits or elapsed time) is met.
2. Frontend/SDK requests the latest Merkle roots from the subgraph and registry.
3. A withdrawal proof is generated in-browser or via the proof worker, packaging:
   - Commitment Merkle path, allowlist Merkle path, and proof witness values.
   - Desired recipient, optional relayer account, relayer fee, and storage refund.
4. Payload is handed to the relayer endpoint (`/relay`). The relayer validates inputs, replays proof verification off-chain, and submits the transaction to NEAR.
5. Recipient wallet receives funds minus fees. The relayer POST response includes transaction hash for user audit.

### Self-Relay / Direct Withdraw
- Advanced users can bypass the relayer and submit the proof directly with `withdraw`.
- SDK exposes helper methods to build NEAR CLI-compatible arguments; the UX mirrors the relayer flow but requires manual gas/storage management.

### Compliance Challenges & Denylist Response
1. Operators or the denylist bot identify suspicious accounts from subgraph analytics or external alerts.
2. The bot enqueues risk checks; if hapi.one returns a high score, it calls `denylist`.
3. Registry updates the allowlist/denylist roots; frontends and relayers detect the new root and refuse proofs referencing the old state.
4. Affected users can appeal off-chain, but funds remain frozen unless risk scores drop below the threshold.

### Relayer Operator Journey
1. Operator deploys the Cloudflare Worker with environment variables pointing to the registry, RPC, and account credentials.
2. The relayer monitors `/fee` requests to quote costs and `/relay` calls to submit withdrawals.
3. It maintains internal accounting for profits (mixing fees minus gas and storage refunds) and rotates keys or bounds fees via scripts in `packages/relayer`.

### Observability & Support
- Frontend surfaces transaction histories using subgraph queries so users can track deposits and withdrawals without leaking identity.
- Support tooling leverages the subgraph and SDK to recreate user proofs, verify nullifier statuses, and diagnose failed withdrawals.

## Monorepo Layout
- `packages/circuits`: Circom/PLONK circuits plus SnarkJS tooling to generate wasm and keys.
- `packages/contract-libraries`: Rust crates reused by contracts (MiMC, bigint arithmetic, Groth16/PLONK verifiers, event helpers).
- `packages/contracts`: NEAR registry and instance smart contracts, Rust/TypeScript tests, seeding utilities, relayer setup scripts.
- `packages/sdk`: TypeScript SDK bundling Merkle tree handling, proof orchestration, GraphQL access, and contract bindings.
- `packages/front`: React + Vite UI for HideYourCash that depends on the SDK and zk artifacts.
- `packages/relayer`: Cloudflare Worker that relays withdrawal transactions and exposes REST endpoints for fee quoting.
- `packages/denylist-bot`: Cloudflare Worker automation to keep the allowlist clean by re-scoring accounts and pushing denylist transactions.
- `packages/subgraph`: The Graph definitions for indexing registry/instance events into queryable data.
- `cypress`: End-to-end smoke tests for the frontend.
- `format_rust.sh`: Helper for formatting Rust code used by lint-staged.
- Root configs: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, Husky/commitlint setup.

## Development Environment

### Prerequisites
- Node.js ≥ 17.5.0 (matching the `.node` engine requirement).
- Yarn 1.22.x.
- Rust toolchain with `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`).
- Circom compiler and SnarkJS CLI. Follow the official [Circom installation guide](https://docs.circom.io/getting-started/installation/).
- NEAR CLI for contract deployment and manual interactions.
- Optional:
  - Docker (if you wrap services locally).
  - The Graph CLI for subgraph deployments.
  - Wrangler CLI for Cloudflare Workers (`npm i -g wrangler`).

### Initial Setup
1. Install dependencies:

```sh
yarn
```

2. Configure Git hooks (Husky installs on postinstall) and validate linting/formatting as needed.
3. Set up environment variables (see [Configuration Reference](#configuration-reference)).

### Core Build Steps
1. **Compile zk circuits** (required by SDK, frontend, and relayer proof verification):

```sh
yarn circuits circuit:setup:plonk
```

   Outputs `withdraw_js/withdraw.wasm`, `withdraw_0000.zkey`, and `verification_key.json` under `packages/circuits/out/`.

2. **Build smart contracts**:

```sh
yarn contracts build:contract
```

   Generates optimized wasm binaries under `packages/contracts`.

3. **Run test suites** (optional but recommended):

```sh
yarn contracts test:rust
yarn contracts test:lib
   yarn sdk test
   yarn front test   # if you add frontend tests
   ```

4. **Populate zk artifacts in dependent packages**:
   - `yarn sdk build` (copies artifacts into SDK tests).
   - `yarn front dev` automatically copies artifacts before Vite starts.

## Package Guides

### Circuits (`packages/circuits`)
- Contains Circom source (`circom/withdraw.circom`, `merkleTree.circom`) and SnarkJS workflows.
- Scripts:
  - `yarn circuit:compile`: produce R1CS, wasm, and C code.
  - `yarn circuit:setup:plonk`: full PLONK trusted setup using the Hermez Powers of Tau ceremony.
  - `yarn circuit:setup`: Groth16 ceremony workflow (multi-step).
- Outputs feed into `packages/contracts` (verifier keys), `packages/sdk` (proof generation), and `packages/front` (browser proof creation).
- `ci_sample_compile_groth16/` provides reference keys and wasm for continuous integration and contract tests.

### Contract Libraries (`packages/contract-libraries`)
- Rust crates compiled to `wasm32-unknown-unknown` for reuse by registry/instance contracts.
- Components:
  - `near_bigint`: deterministic big integer arithmetic utilities.
  - `near_mimc`: MiMC hash functions.
  - `groth_verifier` and `plonk_verifier`: pre-compiled zk proof verifiers.
  - `hyc_events`: event serialization helpers.
- Each crate exposes `yarn` scripts for testing and building release wasm (`build:<crate>`).
- Shared dependencies (e.g., `near-api-js`, `near-workspaces`) enable integration tests across Rust and TypeScript.

### Smart Contracts (`packages/contracts`)
- `registry/`: Registry contract (see detailed README for interface and security notes).
- `instance/`: Mixer instance contract handling deposits, withdrawals, and kill switches.
- `tests-rs/`: Rust-based integration tests orchestrated via `near-workspaces`.
- `tests-ts/`: TypeScript integration tests (triggered by `yarn tests:ts`).
- `relayer_setup/`: Scripts to seed relayer accounts with commitments and storage.
- `testnet_seeder/`: Utilities to deploy registry/instances plus sample data on NEAR testnet.
- `jest.config.js`, `compile.js`, and workspace scripts orchestrate builds/testing.
- Key workflows:

```sh
  yarn contracts build:contract        # compile registry + instance wasm
  yarn contracts test:rust             # Rust integration suite
  yarn contracts test:lib              # Combined library tests
  yarn contracts tests:ts              # TypeScript tests (runs after build)
  yarn contracts seed:testnet          # Deploy sample setup to testnet
  yarn contracts relayer:setup         # Prepare relayer commitments/storage
  ```
- Deployment emits contract IDs and configuration values required by frontend, SDK, relayer, and subgraph.

### SDK (`packages/sdk`)
- TypeScript toolkit used by the frontend and external integrators.
- Modules include `actions/` (contract wrappers), `views/` (data fetchers), `services/` (proof helpers), and `helpers/` (Merkle tree and encoding utilities).
- Build/Test commands:

  ```sh
  yarn sdk build         # bundle to dist/ with tsup
  yarn sdk test          # runs contract TS tests and Jest suites (requires circuits compiled)
  ```
- Copies zk artifacts into `test/` using `yarn add_zk_assets`.
- Exposes both ESM and CJS bundles plus TypeScript declarations for consumption.

### Frontend (`packages/front`)
- Vite + React application featuring wallet selector integration, proof generation workers, and UI components.
- Requires zk artifacts (`public/circuit.zkey`, `public/verifier.wasm`) copied from the circuits build step.
- Scripts:
  ```sh
  yarn front dev        # builds SDK, verifies circuits, copies artifacts, starts Vite
  yarn front build      # prepares production build (SDK build + assets + vite build)
  yarn front preview    # serves production bundle locally
  yarn front add_zk_assets  # manually refresh zk files in public/
  ```
- Key environment variables (via `VITE_` prefix) are consumed through `useEnv`, including:
  - `VITE_CONTRACT`: registry contract account ID.
  - `VITE_NEAR_NODE_URL`: RPC endpoint.
  - `VITE_NEAR_NETWORK`: `mainnet` or `testnet`.
  - `VITE_RELAYER_NETWORK`: network for the relayer Worker.
  - `VITE_API_GRAPHQL_URL`: subgraph endpoint.
  - Optional analytics variables (e.g., `VITE_GTM_ID`, Sentry configuration).
- Integrates with the relayer endpoints for fee calculation and transaction submission.

### Relayer (`packages/relayer`)
- Cloudflare Worker that exposes:
  - `GET /data`: returns relayer metadata (URL, account ID, fee).
  - `POST /fee`: computes required fee given withdrawal parameters.
  - `POST /relay`: submits signed withdrawal proof to the NEAR RPC.
- Uses environment bindings defined in `src/interfaces/env.ts` (`NEAR_NETWORK`, `RPC_URL`, `PRIVATE_KEY`, `ACCOUNT_ID`, `RELAYER_FEE`, `RELAYER_URL`, `HYC_CONTRACT`, `BASE_STORAGE_FEE`).
- Build and deploy with Wrangler:
  ```sh
  yarn relayer build     # via package script (runs ts->worker bundle)
  wrangler dev           # local development with miniflare
  wrangler publish       # deploy to Cloudflare
  ```
- Shares helper modules with the frontend/SDK for proof packing and contract calls.

### Denylist Bot (`packages/denylist-bot`)
- Cloudflare Worker with scheduled jobs and queue consumers to re-evaluate allowlisted accounts.
- Workflow:
  - Cron trigger (`scheduled`) hits a Durable Object responsible for processing pending rechecks.
  - Durable Object fetches recent registry events from the subgraph (`GRAPHQL_URL`) and enqueues accounts needing a risk refresh.
  - Queue consumer (`queue`) evaluates each account via hapi.one (through the SDK/near-api) and invokes `denylist` when the score is above thresholds.
- Environment bindings (`src/types/env.ts`):
  - `NEAR_NETWORK`, `RPC_URL`, `PRIVATE_KEY`, `ACCOUNT_ID`.
  - `HYC_CONTRACT`: registry contract ID.
  - `GRAPHQL_URL`: subgraph endpoint.
  - `QUEUE`, `DURABLE`: Cloudflare queue and durable object bindings configured in `wrangler.toml`.
- Deploy with Wrangler similar to the relayer; ensure cron schedules and queues are configured.

### Subgraph (`packages/subgraph`)
- Contains `schema.graphql`, `subgraph.yaml`, and AssemblyScript mappings in `assembly/`.
- Indexes registry allowlist/denylist updates, commitment insertions, withdrawals, and other contract events.
- Required for:
  - Frontend dashboards (historical stats, Merkle updates).
  - Denylist bot discovery of accounts needing attention.
  - External analytics.
- To deploy:

```sh
  yarn subgraph deploy:hosted <subgraph-name>   # uses The Graph CLI
  ```
- Update `subgraph.yaml` with deployed contract addresses and network, then regenerate types if schema changes (`graph codegen`).

### Testing Suites
- **Rust**: `yarn contracts test:rust` executes NEAR integration tests covering registry/instance behavior.
- **TypeScript**: `yarn contracts tests:ts` and `yarn sdk test` perform cross-package Jest suites.
- **SDK**: Additional coverage for Merkle trees, proof generation, and GraphQL integration (`yarn sdk test:coverage`).
- **Frontend**:
  - Cypress smoke tests under `cypress/e2e/`.
  - Local run: `yarn cypress open` after `yarn front dev`.
- **Cloudflare Workers**: Use `wrangler dev --test-scheduled` and `wrangler queues` to simulate scheduled/queue events.

## Configuration Reference

### Root Scripts
- `yarn circuits <cmd>`: Run commands in the circuits workspace.
- `yarn contracts <cmd>`: Access smart contract tooling.
- `yarn front <cmd>`: Frontend operations.
- `yarn relayer <cmd>` and `yarn denylist <cmd>`: Worker builds/tests.
- `yarn sdk <cmd>`: SDK builds/tests.
- `yarn subgraph <cmd>`: Graph CLI wrapper.

### Environment Variables

| Component | Key | Description |
| --- | --- | --- |
| Frontend | `VITE_CONTRACT` | Registry contract account ID. |
| | `VITE_NEAR_NETWORK` | `mainnet` or `testnet`. |
| | `VITE_NEAR_NODE_URL` | NEAR RPC endpoint URL. |
| | `VITE_RELAYER_NETWORK` | Network slug used for relayer (often matches NEAR network). |
| | `VITE_API_GRAPHQL_URL` | Subgraph GraphQL endpoint. |
| | Optional analytics | `VITE_GTM_ID`, `VITE_SENTRY_DSN`, `VITE_TRACES_SAMPLE_RATE`, etc. |
| Relayer | `NEAR_NETWORK`, `RPC_URL` | NEAR network metadata. |
| | `PRIVATE_KEY`, `ACCOUNT_ID` | Relayer account credentials. |
| | `RELAYER_FEE` | Percentage fee (e.g., `0.01` for 1%). |
| | `BASE_STORAGE_FEE` | NEAR amount reserved for storage registration. |
| | `RELAYER_URL` | Public URL advertised to clients. |
| | `HYC_CONTRACT` | Registry contract ID used to validate roots. |
| Denylist Bot | `GRAPHQL_URL` | Subgraph endpoint for Merkle updates. |
| | `QUEUE`, `DURABLE` | Cloudflare bindings for asynchronous workloads. |
| | `PRIVATE_KEY`, `ACCOUNT_ID` | Operator account authorized to call `denylist`. |
| Subgraph | `NETWORK` config | Set target network and contract addresses in `subgraph.yaml`. |
| Contracts | NEAR CLI ENV | Export `NEAR_ENV`, account IDs, and credentials as needed for deployments/tests. |

Ensure secrets are stored securely (e.g., Cloudflare Secrets, Vercel environment variables, GitHub Actions secrets) and never committed.

## CI / CD
- CI runs linting, builds circuits/contracts where feasible, and executes tests. It also builds and previews the frontend on Vercel.
- Pull Requests trigger preview deployments (`.github/workflows/CI.yml`).
- Merges to `main` trigger production deployments via `.github/workflows/vercel_deploy.yml`.
- Contract artifacts and zk outputs are built deterministically; verify ceremony inputs before regenerating proving keys.

## Resources
- [NEAR Rust SDK tutorial](https://docs.near.org/sdk/rust/introduction)
- [Rust toolchain installer](https://rustup.rs/)
- [Node.js downloads](https://nodejs.org/en/)
- [Yarn Classic](https://yarnpkg.com/)
- [Circom documentation](https://docs.circom.io/getting-started/installation/)
- [SnarkJS reference](https://github.com/iden3/snarkjs)
- [The Graph docs](https://thegraph.com/docs/en/)
- [hapi.one protocol](https://hapi.one/)

---

For questions, reach out to the core maintainers or open a discussion/issue in this repository. Contributions that improve security, documentation, or developer experience are welcome—please follow the existing lint/test workflows before submitting pull requests.
