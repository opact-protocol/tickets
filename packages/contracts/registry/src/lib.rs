use std::collections::HashMap;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize, Deserialize};
use near_bigint::U256;
use near_sdk::{env, near_bindgen, ext_contract, Gas, Promise, PromiseOrValue, PanicOnDefault, AccountId, BorshStorageKey, assert_one_yocto};
use near_sdk::collections::{UnorderedMap, UnorderedSet};
use near_sdk::serde_json::json;

use allowlist_tree::AllowlistMerkleTree;
use near_mimc::{account_hash, u256_mimc_sponge_single};

use hapi_connector::*;
use hyc_events::*;
use ext_interface::*;

mod actions;
mod allowlist_tree;
mod ext_interface;
mod hapi_connector;

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
  pub contracts_allowlist: UnorderedSet<AccountId>,
  // hapi.one contract connector
  pub authorizer: AML,
  // merkle tree containing all authorized accounts after AML
  pub allowlist: AllowlistMerkleTree,
}

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  AML,
  CurrenciesMap,
  AllowlistSet,
  DataStorePrefix,
  DataLocationsPrefix,
  LastRootsPrefix,
  DenylistSetPrefix,
  ZeroValuesPrefix,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(
    owner: AccountId,
    // hapi.one account
    authorizer: AccountId,
    // vec of tupples (category, max_risk_threshold)
    risk_params: Vec<CategoryRisk>,
    // merkle tree params
    height: u64,
    last_roots_len: u8,
    q: U256,
    zero_value: U256,
  ) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );

    let mut authorizer = AML::new(authorizer, StorageKey::AML);
    authorizer.bulk_update_category(risk_params);

    Self {
      owner,
      currencies_map: UnorderedMap::new(StorageKey::CurrenciesMap),
      contracts_allowlist: UnorderedSet::new(StorageKey::AllowlistSet),
      authorizer,
      allowlist: AllowlistMerkleTree::new(
        height,
        last_roots_len,
        StorageKey::DataStorePrefix,
        StorageKey::DataLocationsPrefix,
        StorageKey::LastRootsPrefix,
        StorageKey::DenylistSetPrefix,
        StorageKey::ZeroValuesPrefix,
        q,
        zero_value,
      ),
    }
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

// pub fn assert_risk(authorizer: AML, category_risk: CategoryRisk) -> bool {
//   let (category, risk) = category_risk;
//   if category != Category::None {
//     let accepted_risk = match authorizer.aml_conditions.get(&category) {
//       Some(risk) => risk,
//       None => self
//         .aml_conditions
//         .get(&Category::All)
//         .expect("ERR_NO_DEFAULT_CATEGORY"),
//     };

//     risk <= accepted_risk
//   } else {
//     true
//   }
// }

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
  const AUTHORIZER: &str = "hapione.testnet";
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
      contracts_allowlist: UnorderedSet::new(StorageKey::AllowlistSet),
      authorizer: AML::new(AUTHORIZER.parse().unwrap(), StorageKey::AML),
      allowlist: AllowlistMerkleTree::new(
        20,
        50,
        StorageKey::DataStorePrefix,
        StorageKey::DataLocationsPrefix,
        StorageKey::LastRootsPrefix,
        StorageKey::DenylistSetPrefix,
        StorageKey::ZeroValuesPrefix,
        U256::from_dec_str("10").unwrap(),
        U256::from_dec_str("10").unwrap(),
      ),
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
    assert!(
      contract.currencies_map.len() == 0,
      "initialized with values"
    );
    contract.add_entry(currency.clone(), amount, HYC.parse().unwrap());

    let entries_map = contract.currencies_map.get(&currency).unwrap();

    assert_eq!(entries_map.len(), 1);
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
    assert!(
      contract.currencies_map.len() == 0,
      "initialized with values"
    );
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
    assert!(
      contract.currencies_map.len() == 0,
      "initialized with values"
    );
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
