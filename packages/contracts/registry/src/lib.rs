use std::collections::HashMap;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize, Deserialize};
use near_bigint::U256;
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, assert_one_yocto};
use near_sdk::collections::{UnorderedMap};


#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde", tag = "type")]
pub enum Currency {
  Near,
  Nep141 { account_id: AccountId },
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub owner: AccountId,
  pub currencies_map: UnorderedMap<Currency, HashMap<U256, AccountId>>,
}

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  CurrenciesMap,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(owner: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );
    Self {
      owner,
      currencies_map: UnorderedMap::new(StorageKey::CurrenciesMap),
    }
  }
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn add_entry(&mut self, currency: Currency, amount: U256, contract: AccountId) {
    self.only_owner();
    let mut amount_map = self.currencies_map.get(&currency).unwrap_or(HashMap::new());
    amount_map.insert(amount, contract);
    self.currencies_map.insert(&currency, &amount_map);
  }

  #[payable]
  pub fn remove_entry(&mut self, currency: Currency, amount: U256) {
    self.only_owner();
    let mut amount_map = self
      .currencies_map
      .get(&currency)
      .expect("Currency is not registered");
    amount_map
      .remove(&amount)
      .expect("Amount was not registered for this currency");
    if amount_map.len() == 0 {
      self.currencies_map.remove(&currency);
    } else {
      self.currencies_map.insert(&currency, &amount_map);
    }
  }

  pub fn view_all_currencies(&self) -> Vec<Currency> {
    self.currencies_map.keys().collect()
  }

  pub fn view_currency_contracts(&self, currency: Currency) -> HashMap<U256, AccountId> {
    self.currencies_map.get(&currency).unwrap_or(HashMap::new())
  }
}

impl Contract {
  pub fn only_owner(&self) {
    assert_eq!(
      env::predecessor_account_id(),
      self.owner,
      "This function is restricted to the owner"
    );
    assert_one_yocto();
  }
}
