use near_bigint::U256;
use near_sdk::json_types::{U64};
use near_sdk::serde_json::json;
use near_sdk::{log};

const STANDARD_NAME: &str = "hyde_your_cash";
const STANDARD_VERSION: &str = "1.0.0";

fn log_basic_event_format(standard: &str, version: &str, event_type: &str, data_vec: Vec<&str>) {
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

/// New account was added to whitelist
pub fn event_new_white_list(index: U64, value: U256) {
  let event_type = "new_white_list";
  let event_data = &json!({
      "index": index,
      "value": value,
  })
  .to_string();
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
  let event_data = &json!({
      "nullifier": nullifier
  })
  .to_string();
  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}
