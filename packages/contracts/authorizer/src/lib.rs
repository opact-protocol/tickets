use near_sdk::{near_bindgen, PanicOnDefault, AccountId, env, Promise, PromiseError, Gas, log};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

use crate::ext_interface::ext_transactions_contract;
pub mod ext_interface;

pub const TGAS: u64 = 1_000_000_000_000;

/// mock up implementation of an authorizer smart contract
/// this contract interacts with  the transactions contract
/// and adds users to the whitelist
#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize, PanicOnDefault)]
pub struct Contract {
  pub owner: AccountId,
  //mock-up of the authorzation logic
  pub auth_code: String,
  //address of the anon. transactions contract
  pub trasactions_contract: AccountId,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(owner: AccountId, trasactions_contract: AccountId, auth_code: String) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );
    Self {
      owner,
      trasactions_contract,
      auth_code,
    }
  }
}

#[near_bindgen]
impl Contract {
  ///Mocked up auth function
  /// Should be replaced by complex auth logic with third part
  pub fn whitelist(&mut self, account: AccountId, auth_code: String) -> Promise {
    //mocked up authorization done by a third part is done with a simple assert
    assert_eq!(auth_code, self.auth_code);

    let promise = ext_transactions_contract::ext(self.trasactions_contract.clone())
      .with_static_gas(Gas(5 * TGAS))
      .whitelist(account);

    return promise.then(
      // Create a promise to callback query_greeting_callback
      Self::ext(env::current_account_id())
        .with_static_gas(Gas(5 * TGAS))
        .callback(),
    );
  }

  #[private] // Public - but only callable by env::current_account_id()
  pub fn callback(&self, #[callback_result] call_result: Result<String, PromiseError>) -> String {
    // Check if the promise succeeded by calling the method outlined in external.rs
    if call_result.is_err() {
      log!("There was an error contacting the TRANSACTIONS CONTRACT");
      return "".to_string();
    }
    let msg: String = call_result.unwrap();
    msg
  }
}
