use crate::{
  *,
  hashes::account_hash,
  events::{event_whitelist_update},
};
use near_sdk::{near_bindgen, AccountId, json_types::U64};

#[near_bindgen]
impl Contract {
  /// Verify if caller is one of the authorizers
  /// Add them to WL if they are
  pub fn whitelist(&mut self, account_id: AccountId) {
    assert!(
      self.authorizer.contains(&env::predecessor_account_id()),
      "This account is not a registred authorizer for the white list"
    );

    let account_hash = account_hash(&account_id);

    self.whitelist.add_to_whitelist(account_hash);
    event_whitelist_update(U64(self.whitelist.current_insertion_index), account_hash);
  }

  ///To-do: Create an owner.rs file to add the owner restriceted fn
  /// Adds a new whitelist authorizer
  pub fn new_authorizer(&mut self, authorizer: AccountId) {
    self.only_owner();
    self.add_authorizer(authorizer);
  }
}

impl Contract {
  pub fn add_authorizer(&mut self, account_to_become_authorizer: AccountId) {
    assert!(
      self.authorizer.contains(&account_to_become_authorizer),
      "This account is already an authorizer"
    );
    self.authorizer.insert(&account_to_become_authorizer);
  }
}
