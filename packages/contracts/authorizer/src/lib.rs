use near_sdk::{near_bindgen, PanicOnDefault, AccountId, env};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

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
