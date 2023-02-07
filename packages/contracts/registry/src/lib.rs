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
