import ganache from "ganache-cli";
import Web3 from "web3";

import assert from "assert";

import BigNumber from "bignumber.js";
BigNumber.config({ DECIMAL_PLACES: 3 });

const options = {
  gasLimit: Number.MAX_SAFE_INTEGER,
};
const web3 = new Web3(ganache.provider(options));

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { plonk } from "snarkjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const contractPath = path.resolve(__dirname, "../out", "PlonkVerifier.bin");
const abiPath = path.resolve(__dirname, "../out", "PlonkVerifier.abi");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const bytecode = fs.readFileSync(contractPath, "utf8");

//deploy contracts
let accounts;
let verifier;

const proofPath = path.resolve(__dirname, "../../input", "proof.json");
const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));

const publicPath = path.resolve(__dirname, "../../input", "public.json");
const publicParams = JSON.parse(fs.readFileSync(publicPath, "utf8"));

before(async function () {
  this.timeout(200000);
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  console.log(accounts[0]);
  console.log(await web3.eth.getBalance(accounts[0]));

  // deploy Verifier
  verifier = await new web3.eth.Contract(abi)
    .deploy({
      data: bytecode,
    })
    .send({ from: accounts[0], gas: "10000000" });
});

describe("Verifier contract", (_) => {
  it("deploys contract", () => {
    console.log("addess: ", verifier.options.address);
    assert.ok(verifier.options.address);
  }).timeout(1000000);

  it("verify method works correctly", async () => {
    const callData = await plonk.exportSolidityCallData(proof, publicParams);

    let value = await verifier.methods
      .verifyProof(callData.split(",")[0], publicParams)
      .call();

    assert.ok(value);
  }).timeout(100000);

  // test pat by part
  it("tests partial results", async () => {
    const callData = await plonk.exportSolidityCallData(proof, publicParams);

    let value = await verifier.methods
      .partialProof(callData.split(",")[0], publicParams)
      .call();

    console.log(value);
  });
});
