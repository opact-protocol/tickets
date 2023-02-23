use std::convert::TryInto;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, Vector, LookupSet};
use near_sdk::IntoStorageKey;

use near_bigint::{U256};
use near_mimc::{u256_mimc_sponge};

/// Solidity uses big endian for byte values and little endian for uint256,
/// so we must make sure to always for bytes and little endian for U256
/// to make sure we can copy tornado's hasher and circuit
#[derive(BorshDeserialize, BorshSerialize)]
pub struct MerkleTree {
  pub height: u64,
  pub filled_subtrees: LookupMap<u64, U256>,
  pub current_insertion_index: u64,
  pub last_roots: UnorderedMap<u8, U256>,
  pub last_roots_len: u8,
  pub current_root_index: u8,
  pub field_size: U256,
  pub zero_values: Vector<U256>,

  previous_commitments: LookupSet<U256>,
}

impl MerkleTree {
  pub fn new<S>(
    height: u64,
    last_roots_len: u8,
    filled_subtrees_prefix: S,
    last_roots_prefix: S,
    zero_values_prefix: S,
    previous_commitments_prefix: S,
    field_size: U256,
    zero_value: U256,
  ) -> Self
  where
    S: IntoStorageKey,
  {
    let mut zero_values = Vector::new(zero_values_prefix);
    let mut current_hash = zero_value;
    for _ in 0..height {
      zero_values.push(&current_hash);
      current_hash = u256_mimc_sponge(U256::zero(), [current_hash; 2])[0]
    }
    Self {
      height,
      filled_subtrees: LookupMap::new(filled_subtrees_prefix),
      current_insertion_index: 0,
      last_roots: UnorderedMap::new(last_roots_prefix),
      last_roots_len,
      current_root_index: 0,
      field_size,
      zero_values,
      previous_commitments: LookupSet::new(previous_commitments_prefix),
    }
  }

  /// withdrawal
  pub fn is_known_valid_root(&self, root: U256) -> bool {
    for (_, past_root) in self.last_roots.iter() {
      if root == past_root {
        return true;
      }
    }
    false
  }

  pub fn get_last_root(&self) -> U256 {
    self
      .last_roots
      .get(&self.current_root_index)
      .unwrap_or(self.zeros(self.height - 1))
  }

  /// deposit
  pub fn insert(&mut self, account_hash: U256) -> u64 {
    assert!(!self.previous_commitments.contains(&account_hash));

    let index = self.current_insertion_index;
    assert!(
      index < 2u64.pow(self.height.try_into().unwrap()),
      "Merkle tree is full"
    );
    let mut level_index = index;
    let mut current_hash = account_hash;
    let mut right: U256;
    let mut left: U256;
    for i in 0..self.height {
      if level_index % 2 == 0 {
        // left side of pair
        left = current_hash;
        right = self.zeros(i);
        self.filled_subtrees.insert(&i, &current_hash);
      } else {
        //right side of pair
        left = self.filled_subtrees.get(&i).unwrap();
        right = current_hash;
      }
      current_hash = u256_mimc_sponge(U256::zero(), [left, right])[0];
      level_index /= 2;
    }
    self.update_root(current_hash);

    self.previous_commitments.insert(&account_hash);

    self.current_insertion_index += 1;
    self.current_insertion_index
  }

  fn update_root(&mut self, new_root: U256) {
    let new_root_index = (self.current_root_index + 1) % self.last_roots_len;
    self.last_roots.insert(&new_root_index, &new_root);
    self.current_root_index = new_root_index;
  }

  fn zeros(&self, level: u64) -> U256 {
    self
      .zero_values
      .get(level)
      .expect("Level needs to be lower than height")
  }
}
