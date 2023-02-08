use near_contract_standards::{
  self,
  fungible_token::{
    FungibleToken,
    metadata::{FungibleTokenMetadata, FungibleTokenMetadataProvider},
  },
};
use near_sdk::{
  borsh::{self, BorshDeserialize, BorshSerialize},
  collections::LazyOption,
  env,
  json_types::U128,
  near_bindgen, PanicOnDefault, PromiseOrValue, AccountId, Balance,
};

pub mod errors;

use crate::errors::ERR_001;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
  owner_id: AccountId,
  token: FungibleToken,
  metadata: LazyOption<FungibleTokenMetadata>,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(owner_id: AccountId, total_supply: U128, metadata: FungibleTokenMetadata) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    metadata.assert_valid();
    let mut this = Self {
      owner_id: owner_id.clone(),
      token: FungibleToken::new(b"a".to_vec()),
      metadata: LazyOption::new(b"m".to_vec(), Some(&metadata)),
    };
    this.token.internal_register_account(&owner_id);
    this.token.internal_deposit(&owner_id, total_supply.0);
    this
  }

  fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
    env::log_str(format!("Closed @{} with {}", account_id, balance).as_str());
  }
}

near_contract_standards::impl_fungible_token_core!(Contract, token);
near_contract_standards::impl_fungible_token_storage!(Contract, token, on_account_closed);

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
  fn ft_metadata(&self) -> FungibleTokenMetadata {
    self.metadata.get().unwrap()
  }
}

impl Contract {
  pub fn only_owner(&self) {
    assert_eq!(env::predecessor_account_id(), self.owner_id, "{}", ERR_001);
  }
}
