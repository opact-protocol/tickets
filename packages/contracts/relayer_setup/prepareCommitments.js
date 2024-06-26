const crypto = require("crypto");
const web3utils = require("web3-utils");
const fs = require("fs");
const { readFileSync, writeFile } = fs;

const { providers } = require("near-api-js");

const { BN, toBN } = web3utils;

const circomlibjs = require("circomlibjs");
const { buildMimcSponge } = circomlibjs;

const fixedMerkleTree = require("fixed-merkle-tree");
const { MerkleTree } = fixedMerkleTree;

const wc = require("../../circuits/out/withdraw_js/witness_calculator.js");

const snarkjs = require("snarkjs");
const { plonk } = snarkjs;

const bfj = require("bfj");
const { utils } = require("ffjavascript");
const { stringifyBigInts } = utils;

const Logger = require("logplease");
const logger = Logger.create("snarkJS", { showTimestamp: false });
Logger.setLogLevel("DEBUG");

module.exports = { buildCommitments };

async function buildCommitments(
  config,
  contractAccount,
  user1,
  user2,
  user3,
  user4,
  receiver,
  relayer
) {
  class Mimc {
    constructor() {
      this.sponge = null;
      this.hash = null;
      this.initMimc();
    }

    async initMimc() {
      this.sponge = await buildMimcSponge();
      this.hash = (left, right) =>
        this.sponge.F.toString(
          this.sponge.multiHash([BigInt(left), BigInt(right)])
        );
      this.single_hash = (single) =>
        this.sponge.F.toString(this.sponge.multiHash([BigInt(single)]));
    }
  }

  const mimc = new Mimc();

  await mimc.initMimc();

  function leInt2Buff(value) {
    return new BN(value, 16, "le");
  }

  function randomBN(nbytes = 31) {
    return toBN(leInt2Buff(crypto.randomBytes(nbytes)).toString()).toString();
  }

  function saveCommitment(commitment, name) {
    const jsonData = JSON.stringify(commitment);
    fs.writeFile(name, jsonData, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  async function generate_witness(input, name) {
    const buffer = readFileSync("../../circuits/out/withdraw_js/withdraw.wasm");
    const witnessCalculator = await wc(buffer);
    const buff = await witnessCalculator.calculateWTNSBin(input, 0);
    fs.writeFileSync("temp/" + name, buff, function (err) {
      if (err) throw err;
    });
  }

  async function generate_proof(number) {
    const { proof, publicSignals } = await plonk.prove(
      "../../circuits/out/withdraw_0000.zkey",
      `temp/witness${number}.wtns`,
      logger
    );
    await bfj.write(`./temp/proof${number}.json`, stringifyBigInts(proof), {
      space: 1,
    });
    await bfj.write(
      `./temp/public${number}.json`,
      stringifyBigInts(publicSignals),
      { space: 1 }
    );
  }

  // set accounts that will be used
  const accounts = [user1, user2, user3, user4, receiver];

  const accountsHashes = [
    await hashAccount(config, contractAccount, accounts[0]),
    await hashAccount(config, contractAccount, accounts[1]),
    await hashAccount(config, contractAccount, accounts[2]),
    await hashAccount(config, contractAccount, accounts[3]),
    await hashAccount(config, contractAccount, accounts[4]),
  ];

  let whitelistTree = new MerkleTree(20, accountsHashes, {
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
    hashFunction: mimc.hash,
  });

  // create 4 sets of commitments
  const commitment1 = {
    secret: randomBN(),
    nullifier: randomBN(),
  };
  commitment1["secret_hash"] = mimc.hash(
    commitment1.secret,
    commitment1.nullifier
  );

  const commitment2 = {
    secret: randomBN(),
    nullifier: randomBN(),
  };
  commitment2["secret_hash"] = mimc.hash(
    commitment2.secret,
    commitment2.nullifier
  );

  const commitment3 = {
    secret: randomBN(),
    nullifier: randomBN(),
  };
  commitment3["secret_hash"] = mimc.hash(
    commitment3.secret,
    commitment3.nullifier
  );

  const commitment4 = {
    secret: randomBN(),
    nullifier: randomBN(),
  };
  commitment4["secret_hash"] = mimc.hash(
    commitment4.secret,
    commitment4.nullifier
  );

  saveCommitment(commitment1, "temp/commitment1.json");
  saveCommitment(commitment2, "temp/commitment2.json");
  saveCommitment(commitment3, "temp/commitment3.json");
  saveCommitment(commitment4, "temp/commitment4.json");

  const commitmentLeaves = [
    mimc.hash(commitment1.secret_hash, accountsHashes[0]),
    mimc.hash(commitment2.secret_hash, accountsHashes[1]),
    mimc.hash(commitment3.secret_hash, accountsHashes[2]),
    mimc.hash(commitment4.secret_hash, accountsHashes[3]),
  ];

  let commitmentTree = new MerkleTree(20, commitmentLeaves, {
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
    hashFunction: mimc.hash,
  });

  // create proofs
  const path1 = commitmentTree.proof(commitmentLeaves[0]);
  const pathWL1 = whitelistTree.proof(accountsHashes[0]);

  const path2 = commitmentTree.proof(commitmentLeaves[1]);
  const pathWL2 = whitelistTree.proof(accountsHashes[1]);

  const path3 = commitmentTree.proof(commitmentLeaves[2]);
  const pathWL3 = whitelistTree.proof(accountsHashes[2]);

  const path4 = commitmentTree.proof(commitmentLeaves[3]);
  const pathWL4 = whitelistTree.proof(accountsHashes[3]);

  // commitment 1 will be withdrawn by receiver
  let commitment1Input = {
    root: path1.pathRoot,
    nullifierHash: mimc.single_hash(commitment1.nullifier),
    recipient: accountsHashes[4], // not taking part in any computations
    relayer: await hashAccount(config, contractAccount, relayer), // not taking part in any computations
    fee: "3", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment1.nullifier,
    secret: commitment1.secret,
    pathElements: path1.pathElements,
    pathIndices: path1.pathIndices,

    // reference to current whitelist Merkle Tree
    whitelistRoot: pathWL1.pathRoot,
    // reference to original depositor to enforce whitelist
    originDepositor: accountsHashes[0],
    whitelistPathElements: pathWL1.pathElements,
    whitelistPathIndices: pathWL1.pathIndices,
  };

  // commitment 1 will be withdrawn by receiver
  let commitment2Input = {
    root: path2.pathRoot,
    nullifierHash: mimc.single_hash(commitment2.nullifier),
    recipient: accountsHashes[4], // not taking part in any computations
    relayer: await hashAccount(config, contractAccount, relayer), // not taking part in any computations
    fee: "1", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment2.nullifier,
    secret: commitment2.secret,
    pathElements: path2.pathElements,
    pathIndices: path2.pathIndices,

    // reference to current whitelist Merkle Tree
    whitelistRoot: pathWL2.pathRoot,
    // reference to original depositor to enforce whitelist
    originDepositor: accountsHashes[1],
    whitelistPathElements: pathWL2.pathElements,
    whitelistPathIndices: pathWL2.pathIndices,
  };

  let commitment3Input = {
    root: path3.pathRoot,
    nullifierHash: mimc.single_hash(commitment3.nullifier),
    recipient: accountsHashes[4], // not taking part in any computations
    relayer: await hashAccount(config, contractAccount, relayer), // not taking part in any computations
    fee: "1", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment3.nullifier,
    secret: commitment3.secret,
    pathElements: path3.pathElements,
    pathIndices: path3.pathIndices,

    // reference to current whitelist Merkle Tree
    whitelistRoot: pathWL3.pathRoot,
    // reference to original depositor to enforce whitelist
    originDepositor: accountsHashes[2],
    whitelistPathElements: pathWL3.pathElements,
    whitelistPathIndices: pathWL3.pathIndices,
  };

  let commitment4Input = {
    root: path4.pathRoot,
    nullifierHash: mimc.single_hash(commitment4.nullifier),
    recipient: accountsHashes[4], // not taking part in any computations
    relayer: await hashAccount(config, contractAccount, relayer), // not taking part in any computations
    fee: "3", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment4.nullifier,
    secret: commitment4.secret,
    pathElements: path4.pathElements,
    pathIndices: path4.pathIndices,

    // reference to current whitelist Merkle Tree
    whitelistRoot: pathWL4.pathRoot,
    // reference to original depositor to enforce whitelist
    originDepositor: accountsHashes[3],
    whitelistPathElements: pathWL4.pathElements,
    whitelistPathIndices: pathWL4.pathIndices,
  };

  // generate witness
  await generate_witness(commitment1Input, "witness1.wtns");
  await generate_witness(commitment2Input, "witness2.wtns");
  await generate_witness(commitment3Input, "witness3.wtns");
  await generate_witness(commitment4Input, "witness4.wtns");

  // generate proofs
  await generate_proof(1);
  await generate_proof(2);
  await generate_proof(3);
  await generate_proof(4);
}

async function viewFunction(config, contractId, methodName, args = {}) {
  const provider = new providers.JsonRpcProvider(config.nodeUrl);

  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  });

  return JSON.parse(Buffer.from(res.result).toString());
}

async function hashAccount(config, contractAccount, account) {
  return await viewFunction(
    config,
    contractAccount.accountId,
    "view_account_hash",
    {
      account_id: account.accountId,
    }
  );
}
