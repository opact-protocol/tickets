# Opact Tickets

Opact Tickets is a compliant anonymous transactions tool, that utilizes ZK (Zero-knowledge proof) technology.

The main feature is allowing the mixing of transactions using NEAR or any NEP-141 token only for well inteded users. The system integrates with data providors to block wallets suspicious of money laundering and smart contract hacking.

This works by leveaging [hapi.one protocol] as a data partner which is responsible for allowlisting and denylisting accounts.

## How mixing works

TBD

## Compliance scheme

The compliance scheme works with wallet risk scores.

When a user first deposits to HYC they have to call the `allowlist` method, which queries hapi.one to check for risk score. If it is above the threshold the user is automatically blocked from depositing. This means that the protocol has already identified the user as being in connection with criminal activities.

However, it is always possible that a user performs a hack / scam / is laudering money and has not yet been flagged by hapi.one. In this cases the user will be able to deposit funds without issue.

Here it is necessary to leverage the most innovative technology of the protocol. For mixed transactions to become untraceable, it is necessary that the user waits a determined amount of time (actually wait for a high number of other users to deposit and withdraw) before withdrawing the funds to a new wallet. The bigger the volume being moved, the more time the user has to wait.

We implemented a method called `denylist`, which can be called by anyone to perform a new security score check on any existing account. If the score of the account is found to be above the threshold, any funds that have been deposited by that account cannot be withdrawn anymore.

This means that, even if a malicious user is fast enough to deposit the tokens to HYC before being flagged, while the tokens are being mixed in the protocol, the malicious user runs the risk of being denylisted and losing access to all funds. Essentially a malicious user would have 3 choices:
1. Deposit the funds before being flagged and withdraw really quickly, to avoid getting denylisted -> in this case the anonymity provided by HYC is not enough to stop fund tracking agencies from tracing the token flow;
2. Deposit the funds before being flagged and wait the appropriate time to withdraw -> in this case, the user can be flagged at any moment by automated or human agents and lose all the funds;
3. Not using HYC -> since case (1) does not provide benefits to the malicious user and case (2) is high risk, game theoretical equilibrium is for malicious user to avoid HYC

## Tech

### Installation

Opact Tickets requires [Node.js], [yarn], [rust], [circom] and the rust wasm toolchain. It is recommended that you follow [near sdk tutorial] to install rust and wasm.

After installing all the tools, you can run the command:

```sh
yarn
```
And install all the dependencies

### Circuits

To be able to reproduce tests, deployment and frontend, it is necessary to first compile all zero-knowledge circuits using:
```sh
yarn circuits circuit:setup:plonk
```

### Smart Contracts

**Build**

To build the contracts run:
```sh
yarn contracts build:contract
```

To run tests on smart contracts run:
```sh
yarn contracts test:rust
yarn contracts test:lib
```

To deploy sample testnet app run:
```sh
yarn seed:testnet
```

This will print all relevant addresses generated so that you can set them as environment variables for other apps.

### Subgraph

Subgraph is an indexer using The Graph technology to allow queries on HYC's historical data.

To setup, you must edit `packages/subgraph/subgraph.yaml` to include the addresses to all HYC core contracts and set the network version (mainnet or testnet).

After that you can deploy the subgraph to The Graph's hosted service using [this tutorial](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-hosted/).

The graphql link generated for the subgraph must them be set as an environment variable for both frotend and relayer.

### Relayer

TBD

### Front

To run frontend locally, simply set environment variables described in `packages/front` and run:
```sh
yarn front dev
```

## CI
CI is set to perform all tests and deploy frontend to vercel. Sample deployments are done on PRs and production deployments are done on merges to main.

To change environment variables used in CI deployments alter the following files:
PRs: `.github/workflows/CI.yml`
production: `.github/workflows/vercel_deploy.yml`

   [near sdk tutorial]: <https://docs.near.org/sdk/rust/introduction>
   [rust]: <https://rustup.rs/>
   [Node.js]: <https://nodejs.org/en/>
   [yarn]: <https://yarnpkg.com/>
   [circom]: <https://docs.circom.io/getting-started/installation/>
   [hapi.one protocol]: <https://hapi.one/>



