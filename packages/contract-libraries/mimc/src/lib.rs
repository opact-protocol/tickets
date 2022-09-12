use ff::{Field};
use near_bigint::U256;
use crate::{fp::Fp, round_constants::ROUND_CONSTANTS};

extern crate ff;

mod fp;
mod round_constants;

const INPUTS: usize = 2;
const OUTPUTS: usize = 1;

pub fn u256_mimc_sponge(k: U256, inputs: [U256; INPUTS]) -> [U256; OUTPUTS] {
    let fp_result = mimc_sponge(k.into(), inputs.map(|x| x.into()));
    fp_result.map(|x| x.into())
}

pub fn mimc_sponge(k: Fp, inputs: [Fp; INPUTS]) -> [Fp; OUTPUTS] {
    let mut hash = (Fp::zero(), Fp::zero());

    for &input in inputs.iter() {
        hash = mimc_feistel(k, hash.0 + input, hash.1);
    }

    let mut outputs: [Fp; OUTPUTS] = [Fp::zero(); OUTPUTS];
    outputs[0] = hash.0;

    for i in 1..OUTPUTS {
        hash = mimc_feistel(k, hash.0, hash.1);
        outputs[i] = hash.0;
    }

    outputs
}

fn mimc_feistel(k: Fp, left: Fp, right: Fp) -> (Fp, Fp) {
    let mut x_left = left;
    let mut x_right = right;

    for &round_constant in ROUND_CONSTANTS.iter()  {
        let t = k + x_left + round_constant;
        let t2 = t * t;
        let t5 = t2 * t2 * t;

        (x_left, x_right) = (x_right + t5, x_left);
    }

    (x_right, x_left)
}

#[allow(unused_imports)]
mod tests {
    use ff::{Field, PrimeField};

    use crate::{
        fp::{Fp, FpRepr},
        mimc_feistel,
        U256,
    };

    #[test]
    fn skrrr() {
        let out_left: [u8; 32] = [
            251, 255, 255,  79,  28,  52, 150, 172,
            41, 205,  96, 159, 149, 118, 252,  54,
            46,  70, 121, 120, 111, 163, 110, 102,
            47, 223,   7, 154, 193, 119,  10,  14
        ];
        let out_right: [u8; 32] = [
            246, 255, 255, 159,  56, 104,  44,  89,
            83, 154, 193,  62,  43, 237, 248, 109,
            92, 140, 242, 240, 222,  70, 221, 204,
            94, 190,  15,  52, 131, 239,  20,  28
        ];

        let out_left_mont: [u8; 32] = [
            83, 126, 134,  93,  78, 246, 246,
           204, 117,  16, 175, 163, 162, 181,
           238,  73, 252,  62, 176,  34, 229,
           211, 128,  98,  51, 107, 237, 227,
           142, 247, 198,  40
         ];
        let out_right_mont: [u8; 32] = [
            55, 125, 114,  79,  11, 235, 234,  81,
           157,  36,  17, 141, 124, 202, 147, 255,
            65, 221, 230, 119,  89, 158, 128, 247,
             7, 128, 225,  85, 117, 255, 217,   5
         ];

        let one = Fp::one();
        let two = one + one;
        let three = one + two;

        assert_eq!(one.to_repr().0, U256::one().to_le_bytes());
        assert_eq!(two.to_repr().0, U256::from(2).to_le_bytes());
        assert_eq!(three.to_repr().0, U256::from(3).to_le_bytes());

        // println!("1:{:?}\np+1={:?}", U256::from_dec_str("1").unwrap().to_le_bytes(), Fp::from_str_vartime("21888242871839275222246405745257275088548364400416034343698204186575808495618").unwrap().to_repr().0);
         
        let (a, b) = mimc_feistel(three, one, two);

        let p = U256::from_dec_str(
            "21888242871839275222246405745257275088548364400416034343698204186575808495617",
        )
        .unwrap();

        println!("a={:?}", U256::from_little_endian(&a.to_repr().0).to_string());
        println!("b={:?}", U256::from_little_endian(&b.to_repr().0).to_string());

        println!("E(a)={:?}", U256::from_little_endian(&out_left).to_string());
        println!("E(b)={:?}", U256::from_little_endian(&out_right).to_string());


        assert_eq!(FpRepr(out_left), a.to_repr());
        assert_eq!(FpRepr(out_right), b.to_repr());
    }
}
