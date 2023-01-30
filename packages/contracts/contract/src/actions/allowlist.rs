use near_sdk::{env, near_bindgen, AccountId, Promise, PromiseResult};

use crate::{
  Contract, ContractExt, hashes::account_hash, events::event_allowlist_update,
  ext_interface::ext_self, ext_aml, AML_CHECK_GAS, CALLBACK_AML_GAS, CategoryRisk,
};

#[near_bindgen]
impl Contract {
  /// Verify if caller is one of the authorizers
  /// Add them to WL if they are
  pub fn allowlist(&mut self, account_id: AccountId) -> Promise {
    ext_aml::ext(self.authorizer.get_account())
      .with_static_gas(AML_CHECK_GAS)
      .get_address(account_id.clone())
      .then(
        ext_self::ext(env::current_account_id())
          .with_static_gas(CALLBACK_AML_GAS)
          .allowlist_callback(account_id),
      )
  }

  #[private]
  pub fn allowlist_callback(&mut self, account_id: AccountId) {
    assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
    match env::promise_result(0) {
      PromiseResult::NotReady => unreachable!(),
      PromiseResult::Successful(security_score) => {
        let (_category, risk) =
          near_sdk::serde_json::from_slice::<CategoryRisk>(&security_score).unwrap();

        if risk > self.max_risk {
          env::panic_str(&format!(
            "Account risk score too high. {}, limit is {}",
            risk, &self.max_risk
          ))
        }

        let account_hash = account_hash(&account_id);

        let index = self.allowlist.current_insertion_index;
        event_allowlist_update(self.allowlist.event_count, index, account_hash, account_id, true);
        self.allowlist.add_to_allowlist(account_hash);
        
      }
      PromiseResult::Failed => env::panic_str("ERR_CALL_FAILED"),
    }
  }

  /// Verify if caller is one of the authorizers
  /// Add them to WL if they are
  pub fn denylist(&mut self, account_id: AccountId) -> Promise {
    ext_aml::ext(self.authorizer.get_account())
      .with_static_gas(AML_CHECK_GAS)
      .get_address(account_id.clone())
      .then(
        ext_self::ext(env::current_account_id())
          .with_static_gas(CALLBACK_AML_GAS)
          .denylist_callback(account_id),
      )
  }

  #[private]
  pub fn denylist_callback(&mut self, account_id: AccountId) {
    assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
    match env::promise_result(0) {
      PromiseResult::NotReady => unreachable!(),
      PromiseResult::Successful(security_score) => {
        let (_category, risk) =
          near_sdk::serde_json::from_slice::<CategoryRisk>(&security_score).unwrap();

        if risk <= self.max_risk {
          env::panic_str(&format!(
            "Account risk is acceptable. {}, limit is {}",
            risk, &self.max_risk
          ))
        }

        let account_hash = account_hash(&account_id);

        let event_counter = self.allowlist.event_count;
        let index = self.allowlist.add_to_denylist(account_hash);

        if let Some(index) = index {
          event_allowlist_update(event_counter, index, self.allowlist.zeros(0), account_id, false);
        }
      }
      PromiseResult::Failed => env::panic_str("ERR_CALL_FAILED"),
    }
  }
}
