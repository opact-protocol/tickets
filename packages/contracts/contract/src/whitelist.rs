use crate::{*, serial_hasher::serial_hash};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey};
use near_bigint::U256;
use mimc::u256_mimc_sponge;

#[near_bindgen]
impl Contract {
  /// Verify if caller is one of the authorizers
  /// Add them to WL if they are
  pub fn whitelist(&mut self, account: AccountId) {
    assert!(
      self.authorizer.contains(&account),
      "This account is not a registred authorizer for the white list"
    );

    self.add_to_wl(account);
  }

  ///To-do: Create an owner.rs file to add the owner restriceted fn
  /// Adds a new whitelist authorizer
  pub fn new_authorizer(&mut self, authorizer: AccountId) {
    assert_eq!(
      env::predecessor_account_id(),
      self.owner,
      "This functin is restricted to the owner"
    );
    self.add_authorizer(authorizer);
  }
}

impl Contract {
  pub fn add_to_wl(&mut self, account_to_white_list: AccountId) {
    let account_hash: U256 = serial_hash(U256::zero(), account_to_white_list.to_string().as_str());

    self.white_list.add_to_whitelist(account_hash);
  }

  pub fn add_authorizer(&mut self, account_to_become_authorizer: AccountId) {
    assert!(
      self.authorizer.contains(&account_to_become_authorizer),
      "This account is already and authorizer"
    );
    self.authorizer.insert(&account_to_become_authorizer);
  }
}
