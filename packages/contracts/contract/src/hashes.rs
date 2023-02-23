use near_bigint::U256;
use near_mimc::u256_mimc_sponge;
use near_sdk::AccountId;

pub fn account_hash(account_id: &AccountId, q: U256) -> U256 {
  let account_string = account_id.to_string();
  let account_str = account_string.as_str();

  let id_bytes = account_str.clone().as_bytes();
  let id_len = id_bytes.len();

  let left = U256::from_little_endian(&id_bytes[..id_len / 2]);
  let right = U256::from_little_endian(&id_bytes[id_len / 2..]);

  serial_hash(left, right, q)
}

/// Serial hash takes 2 inputs to be hashed toghether and a prime modulus q
/// Inputs are performed modulo q before being passed to hashing function
pub fn serial_hash(left: U256, right: U256, q: U256) -> U256 {
  let left = left % q;
  let right = right % q;

  u256_mimc_sponge(U256::zero(), [left, right])[0]
}

#[allow(unused_imports)]
mod tests {
  use super::*;

  #[test]
  fn test_doesnt_overflow() {
    // we need to test with account ids with length up to 64
    let q = U256::from_dec_str(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617",
    )
    .unwrap();

    let account_hash = account_hash(
      &AccountId::new_unchecked(
        "zuduzinhoortfdsfsdfsdfdfooooodfgdfgdgddfgdfgdfgdfgfasd.near".to_string(),
      ),
      q,
    );
    serial_hash(U256::one(), account_hash, q);
  }

  #[test]
  fn test_doesnt_overflow2() {
    let q = U256::from_dec_str(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617",
    )
    .unwrap();

    // we need to test with account ids with length up to 64
    let account_hash = account_hash(
      &AccountId::new_unchecked(
        "67769c1579215f87fc58acdb949ceab6e28929de61008506328f873ffb71b052".to_string(),
      ),
      q,
    );
    serial_hash(U256::one(), account_hash, q);
  }

  #[test]
  fn test_doesnt_overflow3() {
    let q = U256::from_dec_str(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617",
    )
    .unwrap();

    // we need to test with account ids with length up to 64
    let account_hash = account_hash(
      &AccountId::new_unchecked(
        "5ab288a1b6b4ab81334c6b7041e6a896bce5ece5c7ab9d2f2f2a50cae1d9c819".to_string(),
      ),
      q,
    );
    serial_hash(U256::one(), account_hash, q);
  }
}
