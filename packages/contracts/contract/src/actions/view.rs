use crate::*;
use near_bigint::U256;
use crate::hashes::account_hash;

#[near_bindgen]
impl Contract {
  pub fn view_a_hash(&self, account_id: AccountId) -> U256 {
    account_hash(&account_id)
  }
}
