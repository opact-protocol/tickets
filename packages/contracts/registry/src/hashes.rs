use near_bigint::U256;
use near_mimc::u256_mimc_sponge;
use near_sdk::AccountId;

// TODO: make this work for longer wallet lengths
// TODO: test for short wallets
pub fn account_hash(account_id: &AccountId) -> U256 {
  let account_string = account_id.to_string();
  let account_str = account_string.as_str();

  let id_bytes = account_str.clone().as_bytes();
  let id_len = id_bytes.len();
  let left = U256::from_little_endian(&id_bytes[..id_len / 2]);
  let right = U256::from_little_endian(&id_bytes[id_len / 2..]);

  serial_hash(left, right)
}

pub fn serial_hash(left: U256, right: U256) -> U256 {
  u256_mimc_sponge(U256::zero(), [left, right])[0]
}

#[allow(unused_imports)]
mod tests {
  use super::*;

  #[test]
  fn test_doesnt_overflow() {
    // we need to test with account ids with length up to 64
    let account_hash = account_hash(&AccountId::new_unchecked(
      "zuduzinhoortfdsfsdfsdfdfooooodfgdfgdgddfgdfgdfgdfgfasd.near".to_string(),
    ));
    serial_hash(U256::one(), account_hash);
  }
}
