use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet, Vector};
use near_bigint::U256;

use crate::{AllowlistMerkleTreeV2, StorageKey};

/// Solidity uses big endian for byte values and little endian for uint256,
/// so we must make sure to always for bytes and little endian for U256
/// to make sure we can copy tornado's hasher and circuit
#[derive(BorshDeserialize, BorshSerialize)]
pub struct AllowlistMerkleTreeV1 {
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
  // counter number of insert/remove events that happened in the tree
  pub event_count: u64,
}

/// implement migration method
impl AllowlistMerkleTreeV1 {
  pub fn migrate(self) -> AllowlistMerkleTreeV2 {
    AllowlistMerkleTreeV2 {
      height: self.height,
      data_store: self.data_store,
      data_locations: self.data_locations,
      current_insertion_index: self.current_insertion_index,
      root_history: LookupMap::new(StorageKey::RootHistoryPrefix),
      most_recent_root: None,
      last_denylist: self.last_denylist,
      denylist_set: self.denylist_set,
      field_size: self.field_size,
      zero_values: self.zero_values,
      // counter number of insert/remove events that happened in the tree
      event_count: self.event_count,
    }
  }
    
}
