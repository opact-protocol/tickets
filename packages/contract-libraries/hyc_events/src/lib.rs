use near_bigint::U256;
use near_sdk::{json_types::U64, serde_json::json, log, AccountId};
use near_sdk::serde_json::Value;

const STANDARD_NAME: &str = "hide_your_cash";
const STANDARD_VERSION: &str = "1.0.0";

fn log_basic_event_format(
  standard: &str,
  version: &str,
  event_type: &str,
  data_vec: Vec<Value>,
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

/// New account was added or removed from allowlist
pub fn event_allowlist_update(
  counter: u64,
  index: u64,
  value: U256,
  account: AccountId,
  allowed: bool,
) {
  let event_type = "updated_allowlist";
  let event_data = json!({
    "counter": counter,
    "index": U64(index),
    "value": value,
    "account": account,
    "allowed": allowed
  });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

/// New account tried to add to allowlist
/// but was denied because of risk score
pub fn event_allowlist_denied(
  account: AccountId,
  category: Value,
  account_risk: u8,
  risk_threshold: u8,
) {
  let event_type = "denied_allowlist";
  let event_data = json!({
    "account": account,
    "category": category,
    "account_risk": account_risk,
    "risk_threshold": risk_threshold,
  });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

/// Withdraw was performed
pub fn event_withdrawal(
  counter: u64,
  recipient: AccountId,
  relayer: Option<AccountId>,
  fee: U256,
  refund: U256,
  nullifier: U256,
) {
  let event_type = "withdrawal";
  let event_data = json!({
   "counter": counter,
   "recipient": recipient,
   "relayer": relayer,
   "fee": fee,
   "refund": refund,
   "nullifier": nullifier
  });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

pub fn event_deposit(index: u64, value: U256) {
  let event_type = "deposit";
  let event_data = json!({
    "counter": index,
    "index": U64(index),
    "value": value
  });

  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}
