use crate::*;

#[near_bindgen]
impl Contract {
  /// Method to active or deactivate kill_switch mode
  /// when kill switch is active, no new deposits can be made to the contract
  /// withdrawals work normally.
  #[payable]
  pub fn toggle_kill_switch(&mut self) {
    self.only_owner();
    self.kill_switch = !self.kill_switch;
  }
}
