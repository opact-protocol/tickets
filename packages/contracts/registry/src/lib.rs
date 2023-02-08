use std::collections::HashMap;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize, Deserialize};
use near_bigint::U256;
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, assert_one_yocto};
use near_sdk::collections::{UnorderedMap, UnorderedSet};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde", tag = "type")]
#[cfg_attr(test, derive(Clone))]
pub enum Currency {
  Near,
  Nep141 { account_id: AccountId },
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  // account that is authorized to modify registry
  pub owner: AccountId,
  // map of current production contracts for HYC in different currencies / deposit values
  pub currencies_map: UnorderedMap<Currency, HashMap<U256, AccountId>>,
  // Set of allowlisted contracts that relayers may trust to service
  pub allowlist_set: UnorderedSet<AccountId>,
}

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  CurrenciesMap,
  AllowlistSet,
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
      allowlist_set: UnorderedSet::new(StorageKey::AllowlistSet),
    }
  }
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn add_entry(&mut self, currency: Currency, amount: U256, account_id: AccountId) {
    self.only_owner();
    let mut amount_map = self.currencies_map.get(&currency).unwrap_or(HashMap::new());
    amount_map.insert(amount, account_id.clone());
    self.currencies_map.insert(&currency, &amount_map);
    self.allowlist_set.insert(&account_id);
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

  #[payable]
  pub fn remove_from_allowlist(&mut self, account_id: AccountId) {
    self.only_owner();
    self.allowlist_set.remove(&account_id);
  }

  pub fn view_all_currencies(&self) -> Vec<Currency> {
    self.currencies_map.keys().collect()
  }

  pub fn view_currency_contracts(&self, currency: Currency) -> HashMap<U256, AccountId> {
    self.currencies_map.get(&currency).unwrap_or(HashMap::new())
  }

  pub fn view_is_in_allowlist(&self, account_id: AccountId) -> bool {
    self.allowlist_set.contains(&account_id)
  }

  /// Returns all elements in allowlist. There is a know limitation to
  /// retrive large lists, however allowlist is not expected to ever exceed 100 elements
  pub fn view_allowlist(&self) -> Vec<AccountId> {
    self.allowlist_set.to_vec()
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

#[cfg(test)]
mod tests {
  pub use near_sdk::{testing_env, Balance, MockedBlockchain, VMContext, Gas};
  pub use near_sdk::{VMConfig, RuntimeFeesConfig};
  pub use near_sdk::test_utils::{get_logs, get_created_receipts};
  pub use near_sdk::mock::{VmAction};
  pub use near_sdk::serde_json::{json};
  pub use near_sdk::collections::{LazyOption};

  pub use std::panic::{UnwindSafe, catch_unwind};
  pub use std::collections::{HashMap};
  pub use std::convert::{TryFrom, TryInto};
  pub use std::str::{from_utf8};

  pub use super::*;

  const CONTRACT: &str = "contract.testnet";
  const OWNER: &str = "owner.testnet";
  const NON_OWNER: &str = "other.testnet";
  const CURRENCY_1: &str = "currency.testnet";
  const CURRENCY_2: &str = "currency2.testnet";
  const HYC: &str = "hyc.testnet";

  pub fn get_context(
    input: Vec<u8>,
    attached_deposit: u128,
    account_balance: u128,
    signer_id: AccountId,
    block_timestamp: u64,
    prepaid_gas: Gas,
  ) -> VMContext {
    VMContext {
      current_account_id: CONTRACT.parse().unwrap(),
      signer_account_id: signer_id.clone(),
      signer_account_pk: vec![0; 33].try_into().unwrap(),
      predecessor_account_id: signer_id.clone(),
      input,
      block_index: 0,
      block_timestamp,
      account_balance,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit,
      prepaid_gas,
      random_seed: [0; 32],
      view_config: None,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }

  pub fn init_contract() -> Contract {
    Contract {
      owner: OWNER.parse().unwrap(),
      currencies_map: UnorderedMap::new(StorageKey::CurrenciesMap),
      allowlist_set: UnorderedSet::new(StorageKey::AllowlistSet),
    }
  }

  #[test]
  fn test_add_entry_happy() {
    let context = get_context(
      vec![],
      1,
      0,
      OWNER.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let currency = Currency::Near;
    let amount = U256::from_dec_str("10").unwrap();

    let mut contract = init_contract();
    assert!(contract.currencies_map.len() == 0, "initialized with values");
    contract.add_entry(currency.clone(), amount, HYC.parse().unwrap());

    let entries_map = contract.currencies_map.get(&currency).unwrap();

    assert_eq!(
      entries_map.len(), 1
    );
    assert_eq!(
      entries_map.get(&amount).unwrap().clone(),
      HYC.parse::<AccountId>().unwrap()
    )
  }

  #[test]
  #[should_panic(expected = "This function is restricted to the owner")]
  fn test_add_entry_non_owner() {
    let context = get_context(
      vec![],
      1,
      0,
      NON_OWNER.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let currency = Currency::Near;
    let amount = U256::from_dec_str("10").unwrap();

    let mut contract = init_contract();
    assert!(contract.currencies_map.len() == 0, "initialized with values");
    contract.add_entry(currency.clone(), amount, HYC.parse().unwrap());

  }

  #[test]
  #[should_panic(expected = "Requires attached deposit of exactly 1 yoctoNEAR")]
  fn test_add_entry_non_yocto() {
    let context = get_context(
      vec![],
      0,
      0,
      OWNER.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let currency = Currency::Near;
    let amount = U256::from_dec_str("10").unwrap();

    let mut contract = init_contract();
    assert!(contract.currencies_map.len() == 0, "initialized with values");
    contract.add_entry(currency.clone(), amount, HYC.parse().unwrap());

  }

  // #[test]
  // fn test_remove_entry_happy() {}

  // #[test]
  // #[should_panic(expected = "This function is restricted to the owner")]
  // fn test_remove_entry_non_owner() {}

  // #[test]
  // #[should_panic(expected = "Requires attached deposit of exactly 1 yoctoNEAR")]
  // fn test_remove_entry_non_yocto() {}

  // #[test]
  // #[should_panic(expected = "Currency is not registered")]
  // fn test_remove_entry_no_currency() {}

  // #[test]
  // #[should_panic(expected = "Amount was not registered for this currency")]
  // fn test_remove_entry_no_amount() {}

  // #[test]
  // fn test_remove_from_allowlist_happy() {}

  // #[test]
  // #[should_panic(expected = "This function is restricted to the owner")]
  // fn test_remove_from_allowlist_non_owner() {}

  // #[test]
  // #[should_panic(expected = "Requires attached deposit of exactly 1 yoctoNEAR")]
  // fn test_remove_from_allowlist_non_yocto() {}
}
