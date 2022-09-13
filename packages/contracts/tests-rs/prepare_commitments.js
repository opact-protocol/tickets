const crypto = require('crypto');
const web3utils = require('web3-utils');
const fs = require('fs');

const { BN, toBN } = web3utils;

const circomlibjs = require('circomlibjs');
const { buildMimcSponge } = circomlibjs;

const fixedMerkleTree = require('fixed-merkle-tree');
const { MerkleTree } = fixedMerkleTree;

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

    // set accounts that will be used
    const accounts = [
        "user.test.near",
        "user2.test.near",
        "user3.test.near",
        "user4.test.near"
    ];

    const accountsHashes = [
        "1825486248499515604837677708822669185877436974182719125952077056001308835722",
        "1975811608399045063312905915518795119998192617341898866046389704086570312369",
        "14805835594172751789454153830321643910352781009925826863181431716035258695586",
        "12677563699590868888937111923812643304058329385394770637468274086770847851520"
    ]

    let whitelistTree = new MerkleTree(20, accountsHashes, {
        zeroElement: '21663839004416932945382355908790599225266501822907911457504978515578255421292',
        hashFunction: mimc.hash
    });

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

    const commitmentLeaves = [
        mimc.hash(commitment1.secret_hash, accountsHashes[0]),
        mimc.hash(commitment2.secret_hash, accountsHashes[1]),
        mimc.hash(commitment3.secret_hash, accountsHashes[2]),
        mimc.hash(commitment4.secret_hash, accountsHashes[3]),
    ];

    let commitmentTree = new MerkleTree(20, commitmentLeaves, {
        zeroElement: '21663839004416932945382355908790599225266501822907911457504978515578255421292',
        hashFunction: mimc.hash
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

    const nullifierHashes = [
        "21086104474227232800393935460814015478975725103042202437637973134177504619938",
        "8254240706376035266498274064987702895664455429409415464200880850024127429752",
        "13252771540914963342929683696377588408648108358404717789439875981176015948239",
        "7359813155397801907900958651437619387810140803255531262941663192539003928769"
    ];

    // commitment 1 will be withdrawn by user 4
    let commitment1Input = {
        root: path1.pathRoot,
        nullifierHash: nullifierHashes[0],
        recipient: accountsHashes[3], // not taking part in any computations
        relayer: "0",  // not taking part in any computations
        fee: "0",      // not taking part in any computations
        refund: "0",   // not taking part in any computations
        nullifier: commitment1.nullifier,
        secret: commitment1.secret,
        pathElements: path1.pathElements,
        pathIndices: path1.pathIndices,

        // reference to current whitelist Merkle Tree
        whitelistRoot: pathWL1.pathRoot,
        // reference to original depositor to enforce whitelist
        originDepositor: accountsHashes[0], 
        whitelistPathElements: pathWL1.pathElements,
        whitelistPathIndices: pathWL1.pathIndices
    };

    

    // create 4 proofs

    

    // transform accountId to hashes

    //save to files
}
buildCommitments()