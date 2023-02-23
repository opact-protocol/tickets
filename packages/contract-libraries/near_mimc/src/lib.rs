use ff_wasm_unknown_unknown::{Field};
use near_bigint::U256;
use crate::{fp::Fp, round_constants::ROUND_CONSTANTS};
use near_sdk::AccountId;

extern crate ff_wasm_unknown_unknown;

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

pub fn u256_mimc_sponge_single(k: U256, inputs: [U256; 1]) -> [U256; 1] {
    let fp_result = mimc_sponge_single(k.into(), inputs.map(|x| x.into()));
    fp_result.map(|x| x.into())
}

pub fn mimc_sponge_single(k: Fp, inputs: [Fp; 1]) -> [Fp; 1] {
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

pub fn account_hash(account_id: &AccountId, q: U256) -> U256 {
    let account_string = account_id.to_string();
    let account_str = account_string.as_str();
  
    let id_bytes = account_str.clone().as_bytes();
    let id_len = id_bytes.len();
    let left = U256::from_little_endian(&id_bytes[..id_len / 2]);
    let right = U256::from_little_endian(&id_bytes[id_len / 2..]);
  
    serial_hash(left, right, q)
  }
  
  pub fn serial_hash(left: U256, right: U256, q: U256) -> U256 {
    let left = left % q;
    let right = right % q;
    u256_mimc_sponge(U256::zero(), [left, right])[0]
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
    use ff_wasm_unknown_unknown::{Field, PrimeField};

    use crate::{
        fp::{Fp, FpRepr},
        mimc_feistel,
        U256,
    };

}
