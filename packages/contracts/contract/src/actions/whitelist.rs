use crate::{*, serial_hasher::serial_hash};
use near_sdk::json_types::U64;
use near_bigint::U256;

#[near_bindgen]
impl Contract {
  /// Verify if caller is one of the authorizers
  /// Add them to WL if they are
  pub fn whitelist(&mut self, account: AccountId) {
    assert!(
      self.authorizer.contains(&account),
      "This account is not a registred authorizer for the white list"
    );

    let account_hash: U256 = serial_hash(U256::zero(), account.to_string().as_str());

    self.white_list.add_to_whitelist(account_hash);
    event_new_white_list(U64(self.white_list.current_insertion_index), account_hash);
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
