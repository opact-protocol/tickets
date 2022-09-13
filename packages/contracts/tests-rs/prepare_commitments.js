const crypto = require('crypto');
const web3utils = require('web3-utils');
const fs = require('fs');

const { BN, toBN } = web3utils;

const circomlibjs = require('circomlibjs');
const { buildMimcSponge } = circomlibjs;


async function buildCommitments() {
    class Mimc {
        constructor() {
            this.sponge = null
            this.hash = null
            this.initMimc()
        }

        async initMimc() {
            this.sponge = await buildMimcSponge()
            this.hash = (left, right) => this.sponge.F.toString(this.sponge.multiHash([BigInt(left), BigInt(right)]))
        }
    }

    const mimc = new Mimc()

    await mimc.initMimc();

    function leInt2Buff(value) {
        return new BN(value, 16, 'le')
    }

    function randomBN(nbytes = 31) {
        return toBN(leInt2Buff(crypto.randomBytes(nbytes)).toString()).toString()
    }

    function saveCommitment(commitment, name) {
        const jsonData = JSON.stringify(commitment);
        fs.writeFile(name, jsonData, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    // create 4 sets of commitments
    const commitment1 = {
        secret: randomBN(),
        nullifier: randomBN()
    };
    commitment1["secret_hash"] = mimc.hash(commitment1.secret, commitment1.nullifier);

    const commitment2 = {
        secret: randomBN(),
        nullifier: randomBN()
    };
    commitment2["secret_hash"] = mimc.hash(commitment2.secret, commitment2.nullifier);

    const commitment3 = {
        secret: randomBN(),
        nullifier: randomBN()
    };
    commitment3["secret_hash"] = mimc.hash(commitment3.secret, commitment3.nullifier);

    const commitment4 = {
        secret: randomBN(),
        nullifier: randomBN()
    };
    commitment4["secret_hash"] = mimc.hash(commitment4.secret, commitment4.nullifier);

    saveCommitment(commitment1, "temp/commitment1.json");
    saveCommitment(commitment2, "temp/commitment2.json");
    saveCommitment(commitment3, "temp/commitment3.json");
    saveCommitment(commitment4, "temp/commitment4.json");

    // create 4 proofs

    // let input1 = {
    //     root: "",
    //     nullifierHash: "",
    //     recipient: "", // not taking part in any computations
    //     relayer: "",  // not taking part in any computations
    //     fee: "",      // not taking part in any computations
    //     refund: "",   // not taking part in any computations
    //     nullifier: "",
    //     secret: "",
    //     pathElements[levels]: "",
    //     pathIndices[levels]: "",

    //     // reference to current whitelist Merkle Tree
    //     whitelistRoot: "",
    //     // reference to original depositor to enforce whitelist
    //     originDepositor: "", 
    //     whitelistPathElements[levelsWhitelist]: "",
    //     whitelistPathIndices[levelsWhitelist]: "",
    // };

    // transform accountId to hashes

    //save to files
}
buildCommitments()