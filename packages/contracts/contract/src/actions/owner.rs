use near_sdk::{env, near_bindgen, assert_one_yocto};

use crate::{Contract, ContractExt};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn toggle_kill_switch(&mut self) {
    assert_eq!(
      env::predecessor_account_id(),
      self.owner,
      "only owner can call"
    );
    assert_one_yocto();
    self.kill_switch = !self.kill_switch;
  }
}
