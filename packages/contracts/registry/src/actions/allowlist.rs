use near_sdk::{env, near_bindgen, AccountId, Promise, PromiseResult};

use crate::{
  Contract, ContractExt, hashes::account_hash, events::event_allowlist_update,
  ext_interface::ext_self, ext_aml, AML_CHECK_GAS, CALLBACK_AML_GAS, CategoryRisk,
};

#[near_bindgen]
impl Contract {
  /// Perform cross contract call to check accounts risk score with AML provider
  /// Callback should process the score and add user to allowlist if score is below threshold
  /// Must charge storage fees to permanently add a new entry to allowlist
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

  /// Callback after checking AML score for account
  /// Is risk score is below threshold, add to allowlist
  /// Otherwise panic
  #[private]
  pub fn allowlist_callback(&mut self, account_id: AccountId) {
    assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
    match env::promise_result(0) {
      PromiseResult::NotReady => unreachable!(),
      PromiseResult::Successful(security_score) => {
        let (category, risk) =
          near_sdk::serde_json::from_slice::<CategoryRisk>(&security_score).unwrap();

        self.authorizer.assert_risk((category, risk));
        // if risk > self.max_risk {
        //   env::panic_str(&format!(
        //     "Account risk score too high. {}, limit is {}",
        //     risk, &self.max_risk
        //   ))
        // }

        let account_hash = account_hash(&account_id, self.verifier.q);

        let index = self.allowlist.current_insertion_index;
        event_allowlist_update(self.allowlist.event_count, index, account_hash, account_id, true);
        self.allowlist.add_to_allowlist(account_hash);
        
      }
      PromiseResult::Failed => env::panic_str("ERR_CALL_FAILED"),
    }
  }

  /// Perform cross contract call to check accounts risk score with AML provider
  /// Callback should process the score and add user to denylist if score is above threshold
  /// This method can be called by anyone that wants to block a malicious account from the platform
  /// In practice, incentives must be created to foster this behavior
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

  /// Callback after checking AML score for account
  /// Is risk score is above threshold, add to denylist
  /// Otherwise panic
  #[private]
  pub fn denylist_callback(&mut self, account_id: AccountId) {
    assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
    match env::promise_result(0) {
      PromiseResult::NotReady => unreachable!(),
      PromiseResult::Successful(security_score) => {
        let (_category, risk) =
          near_sdk::serde_json::from_slice::<CategoryRisk>(&security_score).unwrap();

        // if risk <= self.max_risk {
        //   env::panic_str(&format!(
        //     "Account risk is acceptable. {}, limit is {}",
        //     risk, &self.max_risk
        //   ))
        // }

        let account_hash = account_hash(&account_id, self.verifier.q);

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
