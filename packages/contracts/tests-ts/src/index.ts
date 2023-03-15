import fs from "fs";
// @ts-ignore
import isCI from "is-ci";
import crypto from "crypto";
import * as core from "@actions/core";
import { deployToken, sendDeposit } from "./actions/token";
import { createAccount } from "./actions/account";
import { getConnection } from "./actions/connection";
import { FT_DECIMALS } from "./constants";
import { deployInstance, deployRegistry, addEntry } from "./actions/registry";
import { addBalances, addStorage, registerUser } from "./actions/contracts";
import { buildCommitments } from "./prepare_commitments";
import { readInputs } from "./utils/file";
import { deploySecrets } from './utils/secrets';

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

  const testSetup = JSON.stringify({
    owner: proofInputs.owner,
    account: proofInputs.sdk,
    tokenInstance: tokenInstanceAccount10.accountId,
    hyc_contract: registryAccount.accountId,
    cache: output,
  });

  fs.writeFileSync("../../sdk/test/test_setup.json", testSetup);
  fs.writeFileSync("../../relayer/test/test_setup.json", testSetup);

  if (isCI) {
    console.log("The code is running on a CI server");

    console.log("Exporting env vars");

    core.exportVariable("TESTNET_HYC_CONTRACT", registryAccount.accountId);

    core.exportVariable(
      "TESTNET_RELAYER_ACCOUNT_ID",
      proofInputs.relayer.account_id
    );

    core.exportVariable(
      "TESTNET_RELAYER_PRIVATE_KEY",
      proofInputs.relayer.private_key
    );

    console.log("Exported env vars");

    console.log("Creating relayer secrets");

    await deploySecrets(
      process.env.cftoken,
      'prod-relayer',
      process.env.cfindentifier,
      [
        {
          name: 'ACCOUNT_ID',
          text: proofInputs.relayer.account_id,
          type: 'secret_text',
        },
        {
          name: 'PRIVATE_KEY',
          text: proofInputs.relayer.private_key,
          type: 'secret_text',
        },
        {
          name: 'HYC_CONTRACT',
          text: registryAccount.accountId,
          type: 'secret_text',
        }
      ]
    );

    console.log('finish setup');
  }

  const last_block = await near.connection.provider.block({
    finality: "final",
  });

  console.log("block height", last_block.header.height);

  process.exit();
}

setup();
