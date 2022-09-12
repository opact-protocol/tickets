pragma circom 2.0.5;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "merkleTree.circom";

// computes MiMC(MiMC(nullifier + secret) + originDepositor)
template CommitmentHasher() {
    signal input nullifier;
    signal input secret;
    // add reference to depositor whenever building proof
    signal input originDepositor;
    signal output commitment;
    signal output nullifierHash;

    component commitmentPreHasher = MiMCSponge(2, 220, 1);
    component commitmentFinalHasher = MiMCSponge(2, 220, 1);
    component nullifierHasher = MiMCSponge(1, 220, 1);

    // get nullifier hash
    nullifierHasher.ins[0] <== nullifier;
    nullifierHasher.k <== 0;

    //get pre hash
    signal preHash;
    commitmentPreHasher.ins[0] <== secret;
    commitmentPreHasher.ins[1] <== nullifier;
    commitmentPreHasher.k <== 0;
    preHash <== commitmentPreHasher.outs[0];

    //get final hash
    commitmentFinalHasher.ins[0] <== preHash;
    commitmentFinalHasher.ins[1] <== originDepositor;
    commitmentFinalHasher.k <== 0;

    // assign output signals
    commitment <== commitmentFinalHasher.outs[0];
    nullifierHash <== nullifierHasher.outs[0];
}

// Verifies that commitment that corresponds to given secret and nullifier is included in the merkle tree of deposits
template Withdraw(levels, levelsWhitelist) {
    signal input root;
    signal input nullifierHash;
    signal input recipient; // not taking part in any computations
    signal input relayer;  // not taking part in any computations
    signal input fee;      // not taking part in any computations
    signal input refund;   // not taking part in any computations
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // reference to current whitelist Merkle Tree
    signal input whitelistRoot;
    // reference to original depositor to enforce whitelist
    signal input originDepositor; 
    signal input whitelistPathElements[levelsWhitelist];
    signal input whitelistPathIndices[levelsWhitelist];


    component hasher = CommitmentHasher();
    hasher.nullifier <== nullifier;
    hasher.secret <== secret;
    // add orignDepositor to hash to validate that it was the same used in input
    hasher.originDepositor <== originDepositor;
    hasher.nullifierHash === nullifierHash;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.commitment;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    component whitelistTree = MerkleTreeChecker(levelsWhitelist);
    whitelistTree.leaf <== originDepositor;
    whitelistTree.root <== whitelistRoot;
    for (var i = 0; i < levelsWhitelist; i++) {
        whitelistTree.pathElements[i] <== whitelistPathElements[i];
        whitelistTree.pathIndices[i] <== whitelistPathIndices[i];
    }

    // Add hidden signals to make sure that tampering with recipient or fee will invalidate the snark proof
    // Most likely it is not required, but it's better to stay on the safe side and it only takes 2 constraints
    // Squares are used to prevent optimizer from removing those constraints
    signal recipientSquare;
    signal feeSquare;
    signal relayerSquare;
    signal refundSquare;
    recipientSquare <== recipient * recipient;
    feeSquare <== fee * fee;
    relayerSquare <== relayer * relayer;
    refundSquare <== refund * refund;
}

component main {public
 [root, nullifierHash, recipient, relayer, fee, refund, whitelistRoot]
} = Withdraw(20, 20);