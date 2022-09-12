use near_bigint::U256;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
pub use pairing::{pairing_prod_4, G1Point, G2Point};

mod pairing;

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Verifier {
    pub alfa1: G1Point,
    pub beta2: G2Point,
    pub gamma2: G2Point,
    pub delta2: G2Point,
    pub ic: Vec<G1Point>,
    pub snark_scalar_field: U256,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Proof {
    pub a: G1Point,
    pub b: G2Point,
    pub c: G1Point,
}

impl Verifier {
    pub fn new(
        alfa1: G1Point,
        beta2: G2Point,
        gamma2: G2Point,
        delta2: G2Point,
        ic: Vec<G1Point>,
    ) -> Self {
        Self {
            alfa1,
            beta2,
            gamma2,
            delta2,
            ic,
            snark_scalar_field: U256::from_dec_str(
                "21888242871839275222246405745257275088548364400416034343698204186575808495617",
            )
            .unwrap(),
        }
    }

    pub fn verify(&self, input: Vec<U256>, proof: Proof) -> bool {
        assert_eq!(input.len() + 1, self.ic.len(), "verifier-bas-input");
        let mut vk_x = G1Point {
            x: U256::zero(),
            y: U256::zero(),
        };
        vk_x = G1Point::addition(&vk_x, &self.ic[0]);
        // panic!("{:x?}", input_bytes);
        for i in 0..input.len() {
            assert!(
                input[i] < self.snark_scalar_field,
                "verifier-gte-snark-scalar-field"
            );

            vk_x = G1Point::addition(&vk_x, &self.ic[i + 1].scalar_mul(input[i]));
        }

        pairing_prod_4(
            &proof.a.negate(),
            &proof.b,
            &self.alfa1,
            &self.beta2,
            &vk_x,
            &self.gamma2,
            &proof.c,
            &self.delta2,
        )
    }
}
