use near_sdk::{env, near_bindgen};
use near_bigint::U256;

use crate::{
  Contract, ContractExt,
  hashes::{account_hash, serial_hash},
};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn deposit(&mut self, secrets_hash: U256) {
    assert_eq!(env::attached_deposit(), self.deposit_value);

    let account_hash = account_hash(&env::predecessor_account_id());

    assert!(self.whitelist.is_in_whitelist(&account_hash));

    let commitment = serial_hash(secrets_hash, account_hash);

    self.commitments.insert(commitment);

    // emitir evento
  }
}
