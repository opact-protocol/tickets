const nearAPI = require("near-api-js");
const { BN, KeyPair } = require("near-workspaces");
const fs = require("fs");
const crypto = require("crypto");
const isCI = require("is-ci");
const core = require("@actions/core");

const {
  connect,
  keyStores,
  accountCreator: { UrlAccountCreator },
  providers,
} = nearAPI;

const { buildCommitments } = require("./prepareCommitments");

module.exports = { setup: testnetSetup };

async function getWithdrawPayload(relayer, receiver, proof, publicArgs) {
  return {
    root: publicArgs[0],
    nullifier_hash: publicArgs[1],
    recipient: receiver.accountId,
    relayer: relayer.accountId,
    fee: publicArgs[4],
    refund: publicArgs[5],
    allowlist_root: publicArgs[6],
    a: {
      x: proof["A"][0],
      y: proof["A"][1],
    },
    b: {
      x: proof["B"][0],
      y: proof["B"][1],
    },
    c: {
      x: proof["C"][0],
      y: proof["C"][1],
    },
    z: {
      x: proof["Z"][0],
      y: proof["Z"][1],
    },
    t_1: {
      x: proof["T1"][0],
      y: proof["T1"][1],
    },
    t_2: {
      x: proof["T2"][0],
      y: proof["T2"][1],
    },
    t_3: {
      x: proof["T3"][0],
      y: proof["T3"][1],
    },
    eval_a: proof["eval_a"],
    eval_b: proof["eval_b"],
    eval_c: proof["eval_c"],
    eval_s1: proof["eval_s1"],
    eval_s2: proof["eval_s2"],
    eval_zw: proof["eval_zw"],
    eval_r: proof["eval_r"],
    wxi: {
      x: proof["Wxi"][0],
      y: proof["Wxi"][1],
    },
    wxi_w: {
      x: proof["Wxiw"][0],
      y: proof["Wxiw"][1],
    },
  };
}

async function testnetSetup() {
  if (isCI) {
    console.log("The code is running on a CI server");

    console.log("Exporting env vars");

    core.exportVariable("TESTNET_HYC_CONTRACT", contractAccount.accountId);

    core.exportVariable(
      "TESTNET_RELAYER_ACCOUNT_ID",
      proofInputs.relayer.account_id
    );
    core.exportVariable(
      "TESTNET_RELAYER_PRIVATE_KEY",
      proofInputs.relayer.private_key
    );

    console.log("Exported env vars");
  }

  process.exit();
}

async function createAccount(accountCreator, config, near, account_id) {
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.publicKey;
  await config.deps.keyStore.setKey(config.networkId, account_id, keyPair);
  try {
    await accountCreator.createAccount(account_id, publicKey);
    return await near.account(account_id);
  } catch (err) {
    console.warn(err);
  }
}

function readInputs(relayer) {
  return {
    commitment1: JSON.parse(fs.readFileSync("temp/commitment1.json")),
    commitment2: JSON.parse(fs.readFileSync("temp/commitment2.json")),
    commitment3: JSON.parse(fs.readFileSync("temp/commitment3.json")),
    commitment4: JSON.parse(fs.readFileSync("temp/commitment4.json")),
    proof1: JSON.parse(fs.readFileSync("temp/proof1.json")),
    proof2: JSON.parse(fs.readFileSync("temp/proof2.json")),
    proof3: JSON.parse(fs.readFileSync("temp/proof3.json")),
    proof4: JSON.parse(fs.readFileSync("temp/proof4.json")),
    public1: JSON.parse(fs.readFileSync("temp/public1.json")),
    public2: JSON.parse(fs.readFileSync("temp/public2.json")),
    public3: JSON.parse(fs.readFileSync("temp/public3.json")),
    public4: JSON.parse(fs.readFileSync("temp/public4.json")),
    relayer: JSON.parse(
      fs.readFileSync(`.near-credentials/testnet/${relayer}.json`)
    ),
  };
}

async function registerUser(contractAccount, account) {
  return await account.functionCall({
    contractId: contractAccount.accountId,
    methodName: "allowlist",
    args: {
      account_id: account.accountId,
    },
    gas: "300000000000000",
  });
}

async function deposit(contractAccount, account, commitment) {
  return await account.functionCall({
    contractId: contractAccount.accountId,
    methodName: "deposit",
    args: {
      secrets_hash: commitment.secret_hash,
    },
    gas: "300000000000000",
    attachedDeposit: "10000000000000000000000000",
  });
}
