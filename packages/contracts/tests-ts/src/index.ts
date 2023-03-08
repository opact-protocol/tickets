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

  const user = await createAccount({
    creator,
    config,
    near,
    accountId: `${random_prefix}user.testnet`,
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
    registry: registryAccount,
    account: tokenInstanceAccount10,
    currency: { type: "Nep141", account_id: tokenContractAccount.accountId },
    depositValue: `10${FT_DECIMALS}`,
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
    random_prefix,
    registryAccount.accountId
  );

  console.log("reading inputs");

  const proofInputs = readInputs(relayerAccount, sdkAccount, owner);

  console.log("proofInputs: ", proofInputs);

  console.log("Add storage to users");

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: user,
  });

  await addStorage({
    owner,
    contract: tokenContractAccount,
    receiver: sdkAccount,
  });

  console.log("Register users");

  await registerUser({
    account: user,
    contractAccount: registryAccount,
  });

  console.log("add token balance for users");

  await addBalances(owner, tokenContractAccount, user);

  await addBalances(owner, tokenContractAccount, sdkAccount);

  console.log("send deposits");

  await sendDeposit({
    hash: proofInputs.commitment1.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user,
  });

  await sendDeposit({
    hash: proofInputs.commitment2.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user,
  });

  await sendDeposit({
    hash: proofInputs.commitment3.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user,
  });

  await sendDeposit({
    hash: proofInputs.commitment4.secret_hash,
    contract: tokenInstanceAccount10,
    token: tokenContractAccount,
    signer: user,
  });

  const user_withdraw_payload = await getPublicArgs({
    proof: proofInputs.proof1,
    publicSignals: proofInputs.public1,
    relayer: relayerAccount.accountId,
    receiver: "1mateus.testnet",
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
