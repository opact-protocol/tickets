use crate::*;
use near_bigint::U256;
use crate::serial_hasher::serial_hash;

#[near_bindgen]
impl Contract {
  pub fn view_a_hash(&self, account: AccountId) -> U256 {
    serial_hash(U256::zero(), account.to_string().as_str())
  }
}
