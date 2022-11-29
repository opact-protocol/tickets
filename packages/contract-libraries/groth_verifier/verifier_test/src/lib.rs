use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{near_bindgen, PanicOnDefault};
use near_groth16_verifier::{G1Point, G2Point, Proof, Verifier};

use near_bigint::U256;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub verifier: Verifier,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(
        alfa1: G1Point,
        beta2: G2Point,
        gamma2: G2Point,
        delta2: G2Point,
        ic: Vec<G1Point>,
    ) -> Self {
        Self {
            verifier: Verifier::new(alfa1, beta2, gamma2, delta2, ic),
        }
    }

    pub fn verify(&self, input: Vec<U256>, proof: Proof) -> bool {
        self.verifier.verify(input, proof)
    }
}