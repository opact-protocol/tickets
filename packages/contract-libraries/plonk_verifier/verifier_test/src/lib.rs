use near_plonk_verifier::{Proof, Verifier, G1Point, G2Point, U256};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{near_bindgen, PanicOnDefault};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub verifier: Verifier,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(
        // n values
        power: U256,
        n_public: U256,
        // Q values
        q_m: G1Point,
        q_l: G1Point,
        q_r: G1Point,
        q_o: G1Point,
        q_c: G1Point,
        // S values
        s_1: G1Point,
        s_2: G1Point,
        s_3: G1Point,
        // k values
        k_1: U256,
        k_2: U256,
        // X2 values
        x_2: G2Point,
        // Field size constants
        q: U256,
        qf: U256,
        // omega value
        w1: U256,
    ) -> Self {
        Self {
            verifier: Verifier::new(
                // n values
                power, n_public, // Q values
                q_m, q_l, q_r, q_o, q_c, // S values
                s_1, s_2, s_3, // k values
                k_1, k_2, // X2 values
                x_2, // Field size constants
                q, qf, // omega value
                w1,
            ),
        }
    }

    pub fn verify(&self, proof: Proof) -> bool {
        self.verifier.verify(proof)
    }
}
