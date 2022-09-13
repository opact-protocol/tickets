use near_bigint::U256;
use near_sdk::{
  json_types::{U64, U128},
  serde_json::json,
  log, AccountId,
};

const STANDARD_NAME: &str = "hide_your_cash";
const STANDARD_VERSION: &str = "1.0.0";

fn log_basic_event_format(
  standard: &str,
  version: &str,
  event_type: &str,
  data_vec: Vec<near_sdk::serde_json::Value>,
) {
  log!(
    "EVENT_JSON:{}",
    &json!({
      "standard": standard,
      "version": version,
      "event": event_type,
      "data": data_vec
    })
    .to_string()
  )
}
/// New account was added or removed from whitelist
pub fn event_whitelist_update(index: U64, value: U256) {
  let event_type = "updated_whitelist";
  let event_data = json!({
    "index": index,
    "value": value,
  });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

/// Withdraw was performed
pub fn event_withdrawal(nullifier: U256) {
  let event_type = "withdrawal";
  let event_data = json!({ "nullifier": nullifier });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

/// New account was added to whitelist
pub fn event_blacklist_removal(account_id: AccountId) {
  let event_type = "blacklist_removal";
  let event_data = json!({ "account_id": account_id });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

pub fn event_deposit(account_id: AccountId, value: u128) {
  let event_type = "deposit";
  let event_data = json!({ "account_id": account_id, "value": U128(value) });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}