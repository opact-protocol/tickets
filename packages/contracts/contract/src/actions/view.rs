use crate::*;
use near_bigint::U256;
use crate::hashes::account_hash;
use mimc::u256_mimc_sponge_single;

#[near_bindgen]
impl Contract {
  pub fn view_a_hash(&self, account_id: AccountId) -> U256 {
    account_hash(&account_id)
  }

  pub fn view_nullifier_hash(&self, nullifier: U256) -> U256 {
    u256_mimc_sponge_single(U256::zero(), [nullifier])[0]
  }
}
