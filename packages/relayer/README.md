# Hideyour.cash Relayer

This repository contains the source-code for the Hideyour.cash Relayer. Its written in TypeScript, with the [NestJS](https://docs.nestjs.com framework.

## Installation

### Node.js

If you haven't installed Node.js in your machine previously, you can follow the [official instructions](https://nodejs.org/en/download/current/) to install a current version. Otherwise, this section contains instructions on how to install and switch to a more recent version, if needed.

The e2e test suite uses the `fetch` API, so `package.json` scripts are configured to only run under Node.js v18.0.0 onwards (or v17.5.0 with the `--experimental-fetch` flag). To update your Node.js version, run:
```bash
nvm install 18

# alternatively (not recommended)
nvm install 17.5.0 --experimental-fetch
```

Note that after installing a Node.js version with `nvm`, [Yarn](#yarn) may still use a previously installed one, as its executable is not necessarily the same as the one that `nvm` manages. There are a couple of solutions to this, one of them, on Ubuntu, being to uninstall the `nodejs` executable and then create a symbolic link (e.g. using `ln`) from its (previous) path to the `node` executable's path (or whichever one that's being managed by `nvm`).

You could also avoid this altogether by updating Node.js via your operating system's package manager, but as that is a platform-dependent solution, it is beyond the scope of this document to provide instructions for it, though it shouldn't be hard to find them on the Internet.

### Yarn

It is recommended to use the Yarn package manager. This package is mostly compatible with NPM and others (e.g pNPM), however using Yarn may reduce the occurrence of issues.

Note that the [Yarn install instructions](https://yarnpkg.com/getting-started/install) are for a more recent, and completely different version than is usual in web development currently (and thus, this project). However, should you follow it - and using the [recommended Node.js version](#nodejs) it is easy to do so -, switching versions should be possible with a simple command:

```bash
yarn set version 1.22.19
```

### Dependencies

Then, in order to install the project's dependencies, run:
```bash
yarn
```

## Running the relayer

See also the [environment section](#environment).

```bash
# development
yarn start

# watch mode
yarn start:dev

# production mode
yarn start:prod
```

## Tests

### Unit tests
In order to run the entire unit test suite, use:
```bash
yarn test
```

You can also specify test files (or pass any Jest flags and arguments).
```bash
# to run tests located at src/auth (or any other tests whose paths contain 'auth')
yarn test auth
```

#### Coverage report
To generate a coverage report, run:
```bash
yarn test:cov
```

### End-to-end tests

To run the end-to-end test suite, use:
```bash
yarn test:e2e

# or, specifying the binding port
PORT=65432 yarn test:e2e
```

## Environment
In order to run the app either locally or in production, the following environment variables should be present in your `.env` file:

- `PORT`: the port which the server will bind to and listen from
- `CONTRACT_ID`: the account ID of the Hideyour smart contract
- `NEAR_NETWORK`: the type of network you want to run against (e.g. testnet, mainnet)
- `NEAR_NODE_URL`: the URL for the Near RPC node you want to use
- `ACCOUNT_ID`: the Near account this server will use for RPC calls
- `ACCOUNT_KEYPAIR`: a key pair corresponding to the chose Near Account
