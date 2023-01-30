use merkle_tree::commitment_tree::MerkleTree;
use merkle_tree::allowlist_tree::AllowlistMerkleTree;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey};
use near_sdk::collections::{LookupSet};
use near_plonk_verifier::{self, Verifier, G1Point, G2Point};
use near_bigint::U256;
use hapi_near_connector::aml::*;

mod actions;
mod events;
mod ext_interface;
mod hashes;
mod merkle_tree;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub owner: AccountId,
  pub kill_switch: bool,
  // hapi.one contract's account
  pub authorizer: AML,
  pub max_risk: u8,
  pub commitments: MerkleTree,

  pub allowlist: AllowlistMerkleTree,
  pub deposit_value: u128,
  pub verifier: Verifier,
  pub nullifier: LookupSet<U256>,
  pub nullifier_count: u64,
}

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  Authorizer,
  Nullifier,
  // merkle tree keys
  FilledSubtreesPrefix,
  LastRootsPrefix,
  ZeroValuesPrefix,
  PreviousCommitmentsPrefix,
  // allow list keys
  DataStorePrefix,
  DataLocationsPrefix,
  LastRootsPrefixWL,
  DenylistSetPrefix,
  ZeroValuesPrefixWL,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(
    owner: AccountId,
    authorizer: AccountId,
    max_risk: u8,
    // merkle tree params
    height: u64,
    last_roots_len: u8,
    zero_value: U256,
    // wl params
    height_wl: u64,
    last_roots_len_wl: u8,
    deposit_value: U128,
    // verifier
    power: U256,
    n_public: U256,
    q_m: G1Point,
    q_l: G1Point,
    q_r: G1Point,
    q_o: G1Point,
    q_c: G1Point,
    s_1: G1Point,
    s_2: G1Point,
    s_3: G1Point,
    k_1: U256,
    k_2: U256,
    x_2: G2Point,
    q: U256,
    qf: U256,
    w1: U256,
  ) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );
    Self {
      owner,
      kill_switch: false,
      authorizer: AML::new(authorizer, max_risk),
      max_risk,
      commitments: MerkleTree::new(
        height,
        last_roots_len,
        StorageKey::FilledSubtreesPrefix,
        StorageKey::LastRootsPrefix,
        StorageKey::ZeroValuesPrefix,
        StorageKey::PreviousCommitmentsPrefix,
        q,
        zero_value,
      ),
      allowlist: AllowlistMerkleTree::new(
        height_wl,
        last_roots_len_wl,
        StorageKey::DataStorePrefix,
        StorageKey::DataLocationsPrefix,
        StorageKey::LastRootsPrefixWL,
        StorageKey::DenylistSetPrefix,
        StorageKey::ZeroValuesPrefixWL,
        q,
        zero_value,
      ),
      deposit_value: deposit_value.0,
      verifier: Verifier::new(
        power, n_public, q_m, q_l, q_r, q_o, q_c, s_1, s_2, s_3, k_1, k_2, x_2, q, qf, w1,
      ),
      nullifier: LookupSet::new(StorageKey::Nullifier),
      nullifier_count: 0,
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
  }
}
