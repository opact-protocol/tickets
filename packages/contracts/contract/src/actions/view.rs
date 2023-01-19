use crate::*;
use near_bigint::U256;
use crate::hashes::account_hash;
use near_mimc::u256_mimc_sponge_single;

#[near_bindgen]
impl Contract {
  pub fn view_account_hash(&self, account_id: AccountId) -> U256 {
    account_hash(&account_id)
  }

  pub fn view_nullifier_hash(&self, nullifier: U256) -> U256 {
    u256_mimc_sponge_single(U256::zero(), [nullifier])[0]
  }
  
  pub fn view_commitments_root(&self) -> U256 {
    self.commitments.get_last_root()
  }

  pub fn view_allowlist_root(&self) -> U256 {
    self.allowlist.get_last_root()
  }

  pub fn view_is_in_allowlist(&self, account_id: AccountId) -> bool {
    self.allowlist.is_in_allowlist(&account_hash(&account_id))
  }

  pub fn view_was_nullifier_spent(&self, nullifier: U256) -> bool {
    self.nullifier.contains(&nullifier)
  }

  pub fn view_kill_switch(&self) -> bool {
    self.kill_switch
  }
}
