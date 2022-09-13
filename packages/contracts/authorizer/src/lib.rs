use near_sdk::{
  near_bindgen, PanicOnDefault, AccountId, env, Promise, PromiseError, Gas, log, PromiseResult,
};
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

    promise.then(
      Self::ext(env::current_account_id())
        .with_static_gas(Gas(5 * TGAS))
        .callback_promise_result(),
    )
  }

  #[private]
  pub fn callback_promise_result() -> bool {
    assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
    match env::promise_result(0) {
      PromiseResult::NotReady => unreachable!(),
      PromiseResult::Successful(_) => true,
      PromiseResult::Failed => env::panic_str("ERR_CALL_FAILED"),
    }
  }
}
