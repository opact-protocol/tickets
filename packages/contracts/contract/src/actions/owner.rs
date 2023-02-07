use crate::*;

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn toggle_kill_switch(&mut self) {
    self.only_owner();
    self.kill_switch = !self.kill_switch;
  }
}
