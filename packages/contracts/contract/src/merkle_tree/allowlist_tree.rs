use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet, Vector};
use near_sdk::{env, IntoStorageKey};

use near_mimc::u256_mimc_sponge;
use near_bigint::U256;

pub(crate) fn append(id: &[u8], chr: &[u8]) -> Vec<u8> {
  append_slice(id, chr)
}

pub(crate) fn append_slice(id: &[u8], extra: &[u8]) -> Vec<u8> {
  [id, extra].concat()
}

/// Solidity uses big endian for byte values and little endian for uint256,
/// so we must make sure to always for bytes and little endian for U256
/// to make sure we can copy tornado's hasher and circuit
#[derive(BorshDeserialize, BorshSerialize)]
pub struct AllowlistMerkleTree {
  pub height: u64,
  pub data_store: Vector<LookupMap<u64, U256>>,
  pub data_locations: LookupMap<U256, u64>,
  pub current_insertion_index: u64,
  pub last_roots: UnorderedMap<u8, (U256, u64)>,
  pub last_roots_len: u8,
  pub current_root_index: u8,
  pub last_denylist: u64,
  pub denylist_set: UnorderedSet<U256>,
  pub field_size: U256,
  pub zero_values: Vector<U256>,
}

impl AllowlistMerkleTree {
  pub fn new<S>(
    height: u64,
    last_roots_len: u8,
    data_store_prefix: S,
    data_locations_prefix: S,
    last_roots_prefix: S,
    denylist_set_prefix: S,
    zero_values_prefix: S,
    field_size: U256,
    zero_value: U256,
  ) -> Self
  where
    S: IntoStorageKey + Copy,
  {
    let mut zero_values = Vector::new(zero_values_prefix);
    let mut current_hash = zero_value;
    for _ in 0..height {
      zero_values.push(&current_hash);
      current_hash = u256_mimc_sponge(U256::zero(), [current_hash; 2])[0]
    }

    let mut data_store = Vector::new(data_store_prefix);
    for i in 0..height {
      data_store.push(&LookupMap::new(append(
        &data_store_prefix.into_storage_key(),
        format!("level:{}", i).as_bytes(),
      )));
    }

    Self {
      height,
      data_store,
      data_locations: LookupMap::new(data_locations_prefix),
      current_insertion_index: 0,
      last_roots: UnorderedMap::new(last_roots_prefix),
      last_roots_len,
      current_root_index: 0,
      last_denylist: 0,
      denylist_set: UnorderedSet::new(denylist_set_prefix),
      field_size,
      zero_values,
    }
  }

  /// Call when validating proof to verify if
  /// that proof is correct - must be done before
  pub fn is_known_valid_root(&self, root: U256) -> bool {
    for (_, root_tupple) in self.last_roots.iter() {
      if root == root_tupple.0 {
        return root_tupple.1 > self.last_denylist;
      }
    }
    false
  }

  /// When building the proof, it is necessary
  /// to know the last
  /// TO-DO: Create a view call on main SC to call this fn
  pub fn get_last_root(&self) -> U256 {
    self
      .last_roots
      .get(&self.current_root_index)
      .and_then(|t| Some(t.0))
      .unwrap_or(self.zeros(self.height - 1))
  }

  pub fn is_in_allowlist(&self, account_hash: &U256) -> bool {
    self.data_locations.get(account_hash).is_some()
  }

  /// To-do - expose all of this to owner/guardin
  /// you know
  /// Adds user to allow list and verifies
  pub fn add_to_allowlist(&mut self, account_hash: U256) {
    assert!(
      !self.denylist_set.contains(&account_hash),
      "account is denylisted"
    );

    match self.is_in_allowlist(&account_hash) {
      true => panic!("account is already registered"),
      false => self.insert_to_final_index(account_hash),
    }
  }

  pub fn is_in_denylist(&self, account_hash: U256) -> bool {
    self.denylist_set.contains(&account_hash)
  }

  pub fn remove_from_denylist(&mut self, account_hash: U256) -> bool {
    self.denylist_set.remove(&account_hash)
  }

  pub fn add_to_denylist(&mut self, account_hash: U256) -> Option<u64> {
    self.denylist_set.insert(&account_hash);
    self.last_denylist = env::block_timestamp();
    match self.data_locations.get(&account_hash) {
      Some(location) => {
        self.insert_to_middle(self.zeros(0), location);
        Some(location)
      }
      None => None,
    }
  }

  fn insert_to_final_index(&mut self, account_hash: U256) {
    let index = self.current_insertion_index;
    self.data_locations.insert(&account_hash, &index);
    let mut level_index = index;
    let mut current_hash: U256 = account_hash;
    let mut level_map;
    let mut right: U256;
    let mut left: U256;
    for i in 0..self.height {
      level_map = self.data_store.get(i).unwrap();
      level_map.insert(&level_index, &current_hash);
      if level_index % 2 == 0 {
        // left side of pair
        left = current_hash;
        right = self.zeros(i);
      } else {
        //right side of pair
        left = level_map.get(&(level_index - 1)).unwrap();
        right = current_hash;
      }
      current_hash = u256_mimc_sponge(U256::zero(), [left, right])[0];
      level_index /= 2;
    }
    self.update_root(current_hash);
    self.current_insertion_index += 1;
  }

  fn insert_to_middle(&mut self, account_hash: U256, index: u64) {
    self.data_locations.insert(&account_hash, &index);
    let mut level_index = index;
    let mut current_hash: U256 = account_hash;
    let mut level_map;
    let mut right: U256;
    let mut left: U256;
    for i in 0..self.height {
      level_map = self.data_store.get(i).unwrap();
      level_map.insert(&level_index, &current_hash);
      if level_index % 2 == 0 {
        // left side of pair
        left = current_hash;
        right = level_map.get(&(level_index + 1)).unwrap();
      } else {
        //right side of pair
        left = level_map.get(&(level_index - 1)).unwrap();
        right = current_hash;
      }
      current_hash = u256_mimc_sponge(U256::zero(), [left, right])[0];
      level_index /= 2;
    }
    self.update_root(current_hash);
  }

  fn update_root(&mut self, new_root: U256) {
    let new_root_index = (self.current_root_index + 1) % self.last_roots_len;
    self
      .last_roots
      .insert(&new_root_index, &(new_root, env::block_timestamp()));
    self.current_root_index = new_root_index;
  }

  pub fn zeros(&self, level: u64) -> U256 {
    self
      .zero_values
      .get(level)
      .expect("Level must be lower than height")
  }
}
