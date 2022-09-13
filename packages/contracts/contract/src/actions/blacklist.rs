use crate::{
  *,
  hashes::{account_hash},
  events::{event_whitelist_update, event_blacklist_removal},
};
use near_sdk::{near_bindgen, AccountId, json_types::U64};
use near_bigint::U256;

#[near_bindgen]
impl Contract {
  /// Verify if caller is one of the guardians
  /// Removes user from whitelsit and adds to blacklist
  pub fn blacklist(&mut self, account_id: AccountId) {
    assert!(
      self.guardian.contains(&env::predecessor_account_id()),
      "This account is not a registred guardian for the blacklist"
    );

    let account_hash: U256 = account_hash(&account_id);

    let index = self.whitelist.add_to_blacklist(account_hash);

    if let Some(index) = index {
      event_whitelist_update(U64(index), self.whitelist.zeros(0));
    }
  }

  pub fn remove_blacklist(&mut self, account_id: AccountId) {
    assert!(
      self.guardian.contains(&account_id),
      "This account is not a registred guardian for the blacklist"
    );

    let account_hash: U256 = account_hash(&account_id);

    self.whitelist.remove_from_blacklist(account_hash);

    event_blacklist_removal(account_id);
  }

  pub fn add_guardian(&mut self, account_to_become_guardian: AccountId) {
    self.only_owner();
    assert!(
      !self.guardian.contains(&account_to_become_guardian),
      "This account is already a guardian"
    );
    self.authorizer.insert(&account_to_become_guardian);
  }
}
