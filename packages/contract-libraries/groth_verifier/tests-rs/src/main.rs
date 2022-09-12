use std::path::Path;
use workspaces::{Contract, Account, DevNetwork, Worker};
use workspaces::network::Sandbox;
use std::vec::Vec;
use std::io::Error;
use serde_json::json;
use near_units::parse_near;
use futures::future::{try_join_all};

mod methods;
mod tests_verifier;

pub use methods::*;

pub const OUT_DIR: &str = "../target/wasm32-unknown-unknown/release/";
pub const PROOF_DIR: &str = "../sample_circuit/temp_proofs/";

pub const TO_NANO: u64 = 1_000_000_000;
pub const AVERAGE_BLOCK_TIME: u64 = 1_200_000_000;

pub const GAS_LIMIT: u64 = 300_000_000_000_000;
pub const DEFAULT_GAS: u64 = 3_000_000_000_000;

pub const USER_ACCOUNT_BALANCE: u128 = 5_000_000_000_000_000_000_000_000;
pub const CONTRACT_ACCOUNT_BALANCE: u128 = 200_000_000_000_000_000_000_000_000;

pub const FT_DECIMALS: u8 = 8;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  anyhow::Ok(())
}
