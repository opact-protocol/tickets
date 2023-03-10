// @ts-nocheck
/* eslint-disable */

import { viewFunction } from "./utils/near";

const crypto = require("crypto");
const web3utils = require("web3-utils");
const fs = require("fs");
const { readFileSync, writeFile } = fs;

const { BN, toBN } = web3utils;

const circomlibjs = require("circomlibjs");
const { buildMimcSponge } = circomlibjs;

const fixedMerkleTree = require("fixed-merkle-tree");
const { MerkleTree } = fixedMerkleTree;

const wc = require("../../../circuits/out/withdraw_js/witness_calculator.js");

const snarkjs = require("snarkjs");
const { plonk } = snarkjs;

const bfj = require("bfj");
const { utils } = require("ffjavascript");
const { stringifyBigInts } = utils;

const Logger = require("logplease");
const logger = Logger.create("snarkJS", { showTimestamp: false });
Logger.setLogLevel("DEBUG");

export async function buildCommitments(prefix: string, contract: string) {
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

  async function generate_proof(number) {
    const { proof, publicSignals } = await plonk.prove(
      "../../circuits/out/withdraw_0000.zkey",
      `./witness${number}.wtns`,
      logger
    );
    await bfj.write(`./proof${number}.json`, stringifyBigInts(proof), {
      space: 1,
    });
    await bfj.write(`./public${number}.json`, stringifyBigInts(publicSignals), {
      space: 1,
    });
  }

  const accounts = [
    `${prefix}user.testnet`,
    `${prefix}user.testnet`,
    `${prefix}user.testnet`,
    `${prefix}user.testnet`,
  ];

  const accountsHashes = [
    await hashAccount(contract, accounts[0]),
    await hashAccount(contract, accounts[1]),
    await hashAccount(contract, accounts[2]),
    await hashAccount(contract, accounts[3]),
  ];

  const allowlistTree = new MerkleTree(20, accountsHashes, {
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

  saveCommitment(commitment1, "./commitment1.json");
  saveCommitment(commitment2, "./commitment2.json");
  saveCommitment(commitment3, "./commitment3.json");
  saveCommitment(commitment4, "./commitment4.json");

  const commitmentLeaves = [
    mimc.hash(commitment1.secret_hash, accountsHashes[0]),
    mimc.hash(commitment2.secret_hash, accountsHashes[1]),
    mimc.hash(commitment3.secret_hash, accountsHashes[2]),
    mimc.hash(commitment4.secret_hash, accountsHashes[3]),
  ];

  const commitmentTree = new MerkleTree(20, commitmentLeaves, {
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
    hashFunction: mimc.hash,
  });

  // create proofs
  const path1 = commitmentTree.proof(commitmentLeaves[0]);
  const pathWL1 = allowlistTree.proof(accountsHashes[0]);

  const path2 = commitmentTree.proof(commitmentLeaves[1]);
  const pathWL2 = allowlistTree.proof(accountsHashes[1]);

  const path3 = commitmentTree.proof(commitmentLeaves[2]);
  const pathWL3 = allowlistTree.proof(accountsHashes[2]);

  const path4 = commitmentTree.proof(commitmentLeaves[3]);
  const pathWL4 = allowlistTree.proof(accountsHashes[3]);

  const relayerHash = await hashAccount(contract, `${prefix}relayer.testnet`);

  // commitment 1 will be withdrawn by user 4
  const commitment1Input = {
    root: path1.pathRoot,
    nullifierHash: mimc.single_hash(commitment1.nullifier),
    recipient: accountsHashes[3], // not taking part in any computations
    relayer: relayerHash, // not taking part in any computations
    fee: "1000000", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment1.nullifier,
    secret: commitment1.secret,
    pathElements: path1.pathElements,
    pathIndices: path1.pathIndices,

    // reference to current allowlist Merkle Tree
    allowlistRoot: pathWL1.pathRoot,
    // reference to original depositor to enforce allowlist
    originDepositor: accountsHashes[0],
    allowlistPathElements: pathWL1.pathElements,
    allowlistPathIndices: pathWL1.pathIndices,
  };

  // commitment 1 will be withdrawn by user 4
  const commitment2Input = {
    root: path2.pathRoot,
    nullifierHash: mimc.single_hash(commitment2.nullifier),
    recipient: accountsHashes[3], // not taking part in any computations
    relayer: accountsHashes[0], // not taking part in any computations
    fee: "1000000", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment2.nullifier,
    secret: commitment2.secret,
    pathElements: path2.pathElements,
    pathIndices: path2.pathIndices,

    // reference to current allowlist Merkle Tree
    allowlistRoot: pathWL2.pathRoot,
    // reference to original depositor to enforce allowlist
    originDepositor: accountsHashes[1],
    allowlistPathElements: pathWL2.pathElements,
    allowlistPathIndices: pathWL2.pathIndices,
  };

  // commitment 1 will be withdrawn by user 4
  const commitment3Input = {
    root: path3.pathRoot,
    nullifierHash: mimc.single_hash(commitment3.nullifier),
    recipient: accountsHashes[3], // not taking part in any computations
    relayer: "0", // not taking part in any computations
    fee: "1000", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment3.nullifier,
    secret: commitment3.secret,
    pathElements: path3.pathElements,
    pathIndices: path3.pathIndices,

    // reference to current allowlist Merkle Tree
    allowlistRoot: pathWL3.pathRoot,
    // reference to original depositor to enforce allowlist
    originDepositor: accountsHashes[2],
    allowlistPathElements: pathWL3.pathElements,
    allowlistPathIndices: pathWL3.pathIndices,
  };

  // commitment 1 will be withdrawn by user 4
  const commitment4Input = {
    root: path4.pathRoot,
    nullifierHash: mimc.single_hash(commitment4.nullifier),
    recipient: accountsHashes[3], // not taking part in any computations
    relayer: accountsHashes[0], // not taking part in any computations
    fee: "1000", // not taking part in any computations
    refund: "0", // not taking part in any computations
    nullifier: commitment4.nullifier,
    secret: commitment4.secret,
    pathElements: path4.pathElements,
    pathIndices: path4.pathIndices,

    // reference to current allowlist Merkle Tree
    allowlistRoot: pathWL4.pathRoot,
    // reference to original depositor to enforce allowlist
    originDepositor: accountsHashes[3],
    allowlistPathElements: pathWL4.pathElements,
    allowlistPathIndices: pathWL4.pathIndices,
  };

  // generate witness
  await generate_witness(commitment1Input, "./witness1.wtns");
  await generate_witness(commitment2Input, "./witness2.wtns");
  await generate_witness(commitment3Input, "./witness3.wtns");
  await generate_witness(commitment4Input, "./witness4.wtns");

  // generate proofs
  await generate_proof(1);
  await generate_proof(2);
  await generate_proof(3);
  await generate_proof(4);

  return {
    commitmentLeaves,
    accountsHashes: [accountsHashes[0]],
  };
}

async function hashAccount(contract, account) {
  return await viewFunction(
    "https://rpc.testnet.near.org",
    contract,
    "view_account_hash",
    {
      account_id: account,
    }
  );
}

/* eslint-enable */
