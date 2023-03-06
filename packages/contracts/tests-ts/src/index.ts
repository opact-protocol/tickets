import fs from "fs";
const isCI = require("is-ci");
import crypto from "crypto";
import core from "@actions/core";
import { BN } from "near-workspaces";
import { deployToken, sendDeposit } from "./actions/token";
import { createAccount } from "./actions/account";
import { getConnection } from "./actions/connection";
import { FT_DECIMALS, NEAR_DECIMALS } from "./constants";
import { deployInstance, deployRegistry, addEntry } from "./actions/registry";
import { addBalances, addStorage, registerUser } from "./actions/contracts";
import { getPublicArgs } from "./utils/near";
import { buildCommitments } from "./prepare_commitments";
import { readInputs } from "./utils/file";

export async function setup(): Promise<void> {
  console.log("Creating connection");

  const { near, config, creator } = await getConnection();

  console.log("Save account");

  const random_prefix = crypto.randomBytes(10).toString("hex");

  const registryAccount = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}registryhyctest.testnet`,
  });

  const nearInstanceAccount10 = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}nearhyctest10.testnet`,
  });

  const tokenInstanceAccount10 = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}tokenhyctest10.testnet`,
  });

  const tokenContractAccount = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}tokenaccount.testnet`,
  });

  const owner = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}owner.testnet`,
  });

  const user1 = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}user1.testnet`,
  });

  const user2 = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}user2.testnet`,
  });

  const user3 = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}user3.testnet`,
  });

  const user4 = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}user4.testnet`,
  });

  const receiver = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}receiver.testnet`,
  });

  const relayerAccount = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}relayer.testnet`,
  });

  const sdkAccount = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}sdk.testnet`,
  });

  console.log("Deploying tokens and instances");

  await deployToken({
    owner,
    account: tokenContractAccount,
  });

  await deployRegistry({
    owner,
    account: registryAccount,
  });

  await deployInstance({
    owner,
    account: nearInstanceAccount10,
    registry: registryAccount,
    currency: { type: "Near" },
    depositValue: `10${NEAR_DECIMALS}`,
  });

  await deployInstance({
    owner,
    registry: registryAccount,
    account: tokenInstanceAccount10,
    currency: { type: "Nep141", account_id: tokenContractAccount.accountId },
    depositValue: `10${FT_DECIMALS}`,
  });

  await addEntry({
    owner,
    registry: registryAccount,
    currency: { type: "Near" },
    amount: `10${NEAR_DECIMALS}`,
    instance: nearInstanceAccount10,
  });

  await addEntry({
    owner,
    registry: registryAccount,
    currency: { type: "Nep141", account_id: tokenContractAccount.accountId },
    amount: `10${FT_DECIMALS}`,
    instance: tokenInstanceAccount10,
  });

  await tokenInstanceAccount10.functionCall({
    contractId: registryAccount.accountId,
    methodName: "allowlist",
    args: {
      account_id: tokenInstanceAccount10.accountId,
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("400000000000000000000"),
  });

  console.log("building commitments");

  const output = await buildCommitments(
    [
      `${random_prefix}user1.testnet`,
      `${random_prefix}user2.testnet`,
      `${random_prefix}user3.testnet`,
      `${random_prefix}user4.testnet`,
    ],
    registryAccount.accountId
  );

  console.log("reading inputs");

  const proofInputs = readInputs(relayerAccount, sdkAccount, owner);

  console.log("proofInputs: ", proofInputs);

  console.log("Add storage to users");

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: user1,
  });

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: user2,
  });

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: user3,
  });

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: user4,
  });

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: sdkAccount,
  });

  console.log("Register users");

  await registerUser({
    account: user1,
    contractAccount: registryAccount,
  });

  await registerUser({
    account: user2,
    contractAccount: registryAccount,
  });

  await registerUser({
    account: user3,
    contractAccount: registryAccount,
  });

  await registerUser({
    account: user4,
    contractAccount: registryAccount,
  });

  console.log("add token balance for users");

  await addBalances(owner, tokenContractAccount, user1);

  await addBalances(owner, tokenContractAccount, user2);

  await addBalances(owner, tokenContractAccount, user3);

  await addBalances(owner, tokenContractAccount, user4);

  await addBalances(owner, tokenContractAccount, sdkAccount);

  console.log("send deposits");

  await sendDeposit({
    hash: proofInputs.commitment1.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user1,
  });

  await sendDeposit({
    hash: proofInputs.commitment2.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user2,
  });

  await sendDeposit({
    hash: proofInputs.commitment3.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user3,
  });

  await sendDeposit({
    hash: proofInputs.commitment4.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user4,
  });

  const user_withdraw_payload = await getPublicArgs({
    proof: proofInputs.proof1,
    publicSignals: proofInputs.public1,
    relayer: relayerAccount.accountId,
    receiver: receiver.accountId,
  });

  const relayerTestSetup = JSON.stringify({
    hyc_contract: registryAccount.accountId,
    tokenInstance: tokenInstanceAccount10.accountId,
    user_withdraw_payload: user_withdraw_payload,
    relayer: proofInputs.relayer,
  });

  fs.writeFileSync("../../relayer/test/testnet_setup.json", relayerTestSetup);

  const sdkTestEnv = JSON.stringify({
    owner: proofInputs.owner,
    account: proofInputs.sdk,
    hyc_contract: registryAccount.accountId,
    cache: output,
  });

  fs.writeFileSync("../../sdk/test/env.json", sdkTestEnv);

  // if (isCI) {
  //   console.log("The code is running on a CI server");

  //   console.log("Exporting env vars");

  //   core.exportVariable("TESTNET_HYC_CONTRACT", registryAccount.accountId);

  //   core.exportVariable(
  //     "TESTNET_RELAYER_ACCOUNT_ID",
  //     proofInputs.relayer.account_id
  //   );

  //   core.exportVariable(
  //     "TESTNET_RELAYER_PRIVATE_KEY",
  //     proofInputs.relayer.private_key
  //   );

  //   console.log("Exported env vars");
  // }

  const last_block = await near.connection.provider.block({
    finality: "final",
  });

  console.log("registry id:", last_block.header.height);

  process.exit();
}

setup();
