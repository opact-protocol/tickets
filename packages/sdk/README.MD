# Hideyour.cash

Hideyour.cash is a compliant anonymous transactions tool, that utilizes ZK (Zero-knowledge proof) technology.

The main feature is allowing the mixing of transactions using NEAR or any NEP-141 token only for well inteded users. The system integrates with data providors to block wallets suspicious of money laundering and smart contract hacking.

This works by leveaging [hapi.one protocol] as a data partner which is responsible for allowlisting and denylisting accounts.

## SDK

This SDK is designed to assist developers when interacting with the main functions of the hideyour-cash protocol.

### Installation

Hideyour.cash SDK requires [Node.js] and [yarn].

After installing all the tools, you can run the command:

```sh
yarn
```
And install all the dependencies

### Build

To be able to reproduce tests, deployment and frontend, it is necessary to first compile all zero-knowledge circuits using:
```sh
yarn build
```
