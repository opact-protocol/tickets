const crypto = require('crypto');
const web3utils = require('web3-utils');
const fs = require('fs');

const { BN, toBN } = web3utils; 

function leInt2Buff(value) {
    return new BN(value, 16, 'le')
}

function randomBN(nbytes = 31) {
    return toBN(leInt2Buff(crypto.randomBytes(nbytes)).toString()).toString()
}

function saveCommitment(commitment, name) {
    const jsonData = JSON.stringify(commitment);
    fs.writeFile(name, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

// create 4 sets of commitments
const commitment1 = {
    commitment: randomBN(),
    nullifier: randomBN()
};
const commitment2 = {
    commitment: randomBN(),
    nullifier: randomBN()
};
const commitment3 = {
    commitment: randomBN(),
    nullifier: randomBN()
};
const commitment4 = {
    commitment: randomBN(),
    nullifier: randomBN()
};

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