import { connect, keyStores, accountCreator } from "near-api-js";
import crypto from "crypto";

import {
  createAccount,
  deployInstance,
  deployRegistry,
  deployToken,
  NEAR_DECIMALS,
  FT_DECIMALS,
  addEntry,
} from "./utils";
import { BN } from "near-workspaces";

const { UrlAccountCreator } = accountCreator;

export async function testnetSetup(): Promise<void> {
  // set connection
  const CREDENTIALS_DIR = ".near-credentials";
  const keyStore = new keyStores.UnencryptedFileSystemKeyStore(CREDENTIALS_DIR);

  const config = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
    deps: { keyStore },
  };

  const near = await connect(config);
  const accountCreator = new UrlAccountCreator(
    near.connection,
    config.helperUrl
  );

  let last_block = await near.connection.provider.block({ finality: "final" });
  let last_block_height = last_block.header.height;

  // save accounts
  const random_prefix = crypto.randomBytes(10).toString("hex");
  const registryAccount = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "registryhyctest.testnet"
  );
  const nearInstanceAccount10 = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "nearhyctest10.testnet"
  );
  const nearInstanceAccount100 = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "nearhyctest100.testnet"
  );
  const nearInstanceAccount1000 = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "nearhyctest1000.testnet"
  );
  const tokenInstanceAccount10 = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "tokenhyctest10.testnet"
  );
  const tokenInstanceAccount100 = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "tokenhyctest100.testnet"
  );
  const tokenInstanceAccount1000 = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "tokenhyctest1000.testnet"
  );
  const tokenContractAccount = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "tokenaccount.testnet"
  );
  const owner = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "owner.testnet"
  );

  // deploy token
  await deployToken(tokenContractAccount, owner);

  // deploy registry
  await deployRegistry(registryAccount, owner);

  // deploy instances
  await deployInstance(
    nearInstanceAccount10,
    owner,
    registryAccount,
    { type: "Near" },
    "10" + NEAR_DECIMALS
  );
  await deployInstance(
    nearInstanceAccount100,
    owner,
    registryAccount,
    { type: "Near" },
    "100" + NEAR_DECIMALS
  );
  await deployInstance(
    nearInstanceAccount1000,
    owner,
    registryAccount,
    { type: "Near" },
    "1000" + NEAR_DECIMALS
  );

  await deployInstance(
    tokenInstanceAccount10,
    owner,
    registryAccount,
    { type: "Nep141", account_id: tokenContractAccount.accountId },
    "10" + FT_DECIMALS
  );
  await deployInstance(
    tokenInstanceAccount100,
    owner,
    registryAccount,
    { type: "Nep141", account_id: tokenContractAccount.accountId },
    "100" + FT_DECIMALS
  );
  await deployInstance(
    tokenInstanceAccount1000,
    owner,
    registryAccount,
    { type: "Nep141", account_id: tokenContractAccount.accountId },
    "1000" + FT_DECIMALS
  );

  await addEntry(
    registryAccount,
    owner,
    { type: "Near" },
    "10" + NEAR_DECIMALS,
    nearInstanceAccount10
  );
  await addEntry(
    registryAccount,
    owner,
    { type: "Near" },
    "100" + NEAR_DECIMALS,
    nearInstanceAccount100
  );
  await addEntry(
    registryAccount,
    owner,
    { type: "Near" },
    "1000" + NEAR_DECIMALS,
    nearInstanceAccount1000
  );

  await addEntry(
    registryAccount,
    owner,
    { type: "Nep141", account_id: tokenContractAccount.accountId },
    "10" + FT_DECIMALS,
    tokenInstanceAccount10
  );
  await addEntry(
    registryAccount,
    owner,
    { type: "Nep141", account_id: tokenContractAccount.accountId },
    "100" + FT_DECIMALS,
    tokenInstanceAccount100
  );
  await addEntry(
    registryAccount,
    owner,
    { type: "Nep141", account_id: tokenContractAccount.accountId },
    "1000" + FT_DECIMALS,
    tokenInstanceAccount1000
  );

  await tokenInstanceAccount10.functionCall({
    contractId: registryAccount.accountId,
    methodName: "allowlist",
    args: {
      account_id: tokenInstanceAccount10.accountId,
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("400000000000000000000"),
  });

  console.log("block of creation:", last_block_height);
  console.log("registry id:", registryAccount.accountId);
}
