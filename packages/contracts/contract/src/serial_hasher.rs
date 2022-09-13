use near_bigint::U256;
use mimc::u256_mimc_sponge;

/// This hash fn is used to create the hashes
/// that are inserted on the merkle trees:
/// Commitment trees and Whitlist trees
/// TODO: make this work for longer wallet lengths
/// TODO: test for short wallets
pub fn serial_hash(secrets_hash: U256, wallet: &str) -> U256 {
  let wallet_bytes = wallet.as_bytes();
  let wallet_len = wallet_bytes.len();
  let left_wallet = U256::from_little_endian(&wallet_bytes[..wallet_len / 2]);
  let right_wallet = U256::from_little_endian(&wallet_bytes[wallet_len / 2..]);

  let wallet_hash = u256_mimc_sponge(U256::zero(), [left_wallet, right_wallet])[0];

  u256_mimc_sponge(U256::zero(), [secrets_hash, wallet_hash])[0]
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn hello() {
    serial_hash(
      U256::one(),
      "duduzinhoortfdsfsdfsdfdfooooodfgdfgdgddfgdfgdfgdfgfasd.near",
    );
  }
}
