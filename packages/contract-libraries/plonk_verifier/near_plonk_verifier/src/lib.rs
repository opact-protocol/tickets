pub use near_bigint::{U256, U512};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::env;
use near_sdk::serde::{Deserialize, Serialize};

use signed_u256::SignedU256;

mod modinverse;
mod pairing;
mod signed_u256;

mod calculate_challanges;
mod calculate_lagrange;
mod calculate_pl;
mod calculate_points;
mod calculate_t;

use modinverse::*;
pub use pairing::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Verifier {
    // n values
    pub power: U256,
    pub n: U256,
    pub n_public: U256,
    pub n_lagrange: U256,
    // Q values
    pub q_m: G1Point,
    pub q_l: G1Point,
    pub q_r: G1Point,
    pub q_o: G1Point,
    pub q_c: G1Point,
    // S values
    pub s_1: G1Point,
    pub s_2: G1Point,
    pub s_3: G1Point,
    // k values
    pub k_1: U256,
    pub k_2: U256,
    // X2 values
    pub x_2: G2Point,
    // Field size constants
    pub q: U256,
    pub qf: U256,
    // omega value
    pub w1: U256,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Proof {
    // public values
    pub public_values: Vec<U256>,
    // proof values
    pub a: G1Point,
    pub b: G1Point,
    pub c: G1Point,
    pub z: G1Point,
    pub t_1: G1Point,
    pub t_2: G1Point,
    pub t_3: G1Point,
    pub eval_a: U256,
    pub eval_b: U256,
    pub eval_c: U256,
    pub eval_s1: U256,
    pub eval_s2: U256,
    pub eval_zw: U256,
    pub eval_r: U256,
    pub wxi: G1Point,
    pub wxi_w: G1Point,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct TempValues {
    alpha: Option<U256>,
    beta: Option<U256>,
    gamma: Option<U256>,
    xi: Option<U256>,
    xin: Option<U256>,
    beta_xi: Option<U256>,
    v_1: Option<U256>,
    v_2: Option<U256>,
    v_3: Option<U256>,
    v_4: Option<U256>,
    v_5: Option<U256>,
    v_6: Option<U256>,
    u: Option<U256>,
    pl: Option<U256>,
    eval_t: Option<U256>,
    a_1: Option<G1Point>,
    b_1: Option<G1Point>,
    zh: Option<U256>,
    zh_inv: Option<U256>,
    eval_l: Vec<U256>,
}


impl TempValues {
    pub fn new() -> Self {
        Self {
            alpha: None,
            beta: None,
            gamma: None,
            xi: None,
            xin: None,
            beta_xi: None,
            v_1: None,
            v_2: None,
            v_3: None,
            v_4: None,
            v_5: None,
            v_6: None,
            u: None,
            pl: None,
            eval_t: None,
            a_1: None,
            b_1: None,
            zh: None,
            zh_inv: None,
            eval_l: vec![],
        }
    }
}

impl Verifier {
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
        let q_m = transform_point(q_m);
        let q_l = transform_point(q_l);
        let q_r = transform_point(q_r);
        let q_o = transform_point(q_o);
        let q_c = transform_point(q_c);
        let s_1 = transform_point(s_1);
        let s_2 = transform_point(s_2);
        let s_3 = transform_point(s_3);

        let n = U256::from_dec_str(&2u128.pow(power.try_into().unwrap()).to_string()).unwrap();
        let n_lagrange = if n_public == U256::zero() {
            U256::one()
        } else {
            n_public
        };

        Self {
            power,
            n,
            n_public,
            n_lagrange,
            q_m,
            q_l,
            q_r,
            q_o,
            q_c,
            s_1,
            s_2,
            s_3,
            k_1,
            k_2,
            x_2,
            q,
            qf,
            w1,
        }
    }

    pub fn verify(&self, proof: Proof) -> bool {
        let mut temp = TempValues::new();
        self.check_input(proof.clone());
        self.calculate_challanges(proof.clone(), &mut temp);
        self.calculate_lagrange(&mut temp);
        self.calculate_pl(proof.clone(), &mut temp);
        self.calculate_t(proof.clone(), &mut temp);
        self.calculate_a1(proof.clone(), &mut temp);
        self.calculate_b1(proof.clone(), &mut temp);

        self.check_pairing(temp)
    }

    /// checks that values are within field
    fn check_input(&self, proof: Proof) {
        assert_eq!(
            self.n_public.as_usize(),
            proof.public_values.len(),
            "Wrong quantity of public args. Passed {}, should be {}",
            proof.public_values.len(),
            self.n_public
        );

        for value in proof.public_values {
            self.check_value(value);
        }

        self.check_value(proof.eval_a);
        self.check_value(proof.eval_b);
        self.check_value(proof.eval_c);
        self.check_value(proof.eval_s1);
        self.check_value(proof.eval_s2);
        self.check_value(proof.eval_zw);
        self.check_value(proof.eval_r);
    }

    /// Checks if a values is valid within field
    fn check_value(&self, value: U256) {
        assert!(value < self.q, "value outside field range");
    }

    fn check_pairing(&self, temp: TempValues) -> bool {
        let s = (self.qf - temp.b_1.unwrap().y) % self.qf;
        let b_1_alt = G1Point {
            x: temp.b_1.unwrap().x,
            y: s,
        };

        pairing_prod_2(&temp.a_1.unwrap(), &self.x_2, &b_1_alt, &G2Point::p2())
    }
}

pub fn mulmod(a: U256, b: U256, c: U256) -> U256 {
    let a = U512::from_little_endian(&a.to_le_bytes());
    let b = U512::from_little_endian(&b.to_le_bytes());
    let c = U512::from_little_endian(&c.to_le_bytes());
    let result = (a * b) % c;
    U256::from_little_endian(&result.to_le_bytes()[0..32])
}

pub fn transform_point(point: G1Point) -> G1Point {
    G1Point {
        x: point.x,
        y: if point.x == U256::zero() {
            U256::zero()
        } else {
            point.y
        },
    }
}
