use crate::{*, serial_hasher::serial_hash, events::event_white_list_update};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, json_types::U64};
use near_bigint::U256;

#[near_bindgen]
impl Contract {
  /// Verify if caller is one of the guardians
  /// Removes user from whitelsit and adds to blacklist
  pub fn blacklist(&mut self, account: AccountId) {
    assert!(
      self.guardian.contains(&account),
      "This account is not a registred guardian for the blacklist"
    );

    let account_hash: U256 = serial_hash(U256::zero(), account.to_string().as_str());

    let index = self.white_list.add_to_blacklist(account_hash);
    //event_new_white_list(U64(self.white_list.), account_hash);
    if let Some(index) = index {
      event_white_list_update(U64(index), account_hash);
    }
  }

  pub fn add_guardian(&mut self, account_to_become_guardian: AccountId) {
    self.only_owner();
    assert!(
      self.guardian.contains(&account_to_become_guardian),
      "This account is already a guardian"
    );
    self.authorizer.insert(&account_to_become_guardian);
  }
}
