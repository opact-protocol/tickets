const crypto = require("crypto");
const web3utils = require("web3-utils");
const fs = require("fs");
const { readFileSync } = fs;

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

async function buildCommitments(config, contractAccount, user1, receiver) {
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
    fs.writeFileSync(name, buff, function (err) {
      if (err) throw err;
    });
  }

  async function generate_proof(witnessPath, proofPath, publicPath) {
    const { proof, publicSignals } = await plonk.prove(
      "../../circuits/out/withdraw_0000.zkey",
      witnessPath,
      logger
    );
    await bfj.write(proofPath, stringifyBigInts(proof), {
      space: 1,
    });
    await bfj.write(publicPath, stringifyBigInts(publicSignals), { space: 1 });
  }

  // set accounts that will be used
  const accounts = [user1, receiver];

  const accountsHashes = [
    await hashAccount(config, contractAccount, accounts[0]),
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

  saveCommitment(commitment1, "temp/commitment1.json");

  const commitmentLeaves = [
    mimc.hash(commitment1.secret_hash, accountsHashes[0]),
  ];

  let commitmentTree = new MerkleTree(20, commitmentLeaves, {
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
    hashFunction: mimc.hash,
  });

  // create proofs
  const path1 = commitmentTree.proof(commitmentLeaves[0]);
  const pathWL1 = whitelistTree.proof(accountsHashes[0]);

  // commitment 1 will be withdrawn by receiver
  let commitment1Input = {
    root: path1.pathRoot,
    nullifierHash: mimc.single_hash(commitment1.nullifier),
    recipient: accountsHashes[0], // not taking part in any computations
    relayer: "0", // not taking part in any computations
    fee: "0", // not taking part in any computations
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
  // generate witness
  await generate_witness(commitment1Input, "temp/witness1.wtns");

  // generate proofs
  await generate_proof(
    "./temp/witness1.wtns",
    "./temp/proof1.json",
    "./temp/public1.json"
  );
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
