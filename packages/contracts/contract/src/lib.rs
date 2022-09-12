use merkle_tree::commitment_tree::MerkleTree;
use merkle_tree::whitelist_tree::WhitelistMerkleTree;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey};
use near_sdk::collections::{LookupSet};
use rust_verifier::Verifier;
use near_bigint::U256;

mod merkle_tree;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub owner: AccountId,
  pub guardian: LookupSet<AccountId>,
  pub commitments: MerkleTree,
  pub white_list: WhitelistMerkleTree,
  pub value_of_deposit: U128,
  pub verifier: Verifier,
  pub nullifier: LookupSet<U256>,
}

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  Guardian,
  Nullifier,
  // merkle tree keys
  FilledSubtreesPrefix,
  LastRootsPrefix,
  ZeroValuesPrefix,
  // white list keys
  DataStorePrefix,
  DataLocationsPrefix,
  LastRootsPrefixWL,
  BlacklistSetPrefix,
  ZeroValuesPrefixWL,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(
    owner: AccountId,
    // merkle tree params
    height: u64,
    last_roots_len: u8,
    field_size: U256, // it's the same for wl
    zero_value: U256,
    // wl params
    height_wl: u64,
    last_roots_len_wl: u8,
    zero_value_wl: U256,
    value_of_deposit: U128,
    // verifier
    verifier: Verifier,
  ) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );
    Self {
      owner,
      guardian: LookupSet::new(StorageKey::Guardian),
      commitments: MerkleTree::new(
        height,
        last_roots_len,
        StorageKey::FilledSubtreesPrefix,
        StorageKey::LastRootsPrefix,
        StorageKey::ZeroValuesPrefix,
        field_size,
        zero_value,
      ),
      white_list: WhitelistMerkleTree::new(
        height_wl,
        last_roots_len_wl,
        StorageKey::DataStorePrefix,
        StorageKey::DataLocationsPrefix,
        StorageKey::LastRootsPrefixWL,
        StorageKey::BlacklistSetPrefix,
        StorageKey::ZeroValuesPrefixWL,
        field_size,
        zero_value_wl,
      ),
      value_of_deposit,
      verifier,
      nullifier: LookupSet::new(StorageKey::Nullifier),
    }
  }
}
