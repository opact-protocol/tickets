use crate::*;

/// Gs units required to execute aml lookup in hapi.one's contract
pub const AML_CHECK_GAS: Gas = Gas(10_000_000_000_000);
/// yoctoNEAT price to store a new account in allowlist. is composed of:
/// (1) U256 hash of account in tree -> 32 bytes
/// (2) u64 location of item in tree -> 8 bytes
/// Total cost = 40 bytes
/// Cost per byte = 10_000_000_000_000_000_000
/// Total cost = 400_000_000_000_000_000_000
pub const ALLOWLIST_STORAGE_COST: u128 = 400_000_000_000_000_000_000;
/// yoctoNEAT price to store a new account in denylist. is composed of:
/// (1) U256 hash of account in denylist_set -> 32 bytes
/// Total cost = 32 bytes
/// Cost per byte = 10_000_000_000_000_000_000
/// Total cost = 320_000_000_000_000_000_000
pub const DENYLIST_STORAGE_COST: u128 = 320_000_000_000_000_000_000;

#[near_bindgen]
impl Contract {
  /// Perform cross contract call to check accounts risk score with AML provider
  /// Callback should process the score and add user to allowlist if score is below threshold
  /// Must charge storage fees to permanently add a new entry to allowlist
  #[payable]
  pub fn allowlist(&mut self, account_id: AccountId) -> Promise {
    assert_eq!(
      env::attached_deposit(),
      ALLOWLIST_STORAGE_COST,
      "Must attach a deposit of exactly {} yoctoNEAR to cover storage costs",
      ALLOWLIST_STORAGE_COST
    );
    ext_aml::ext(self.authorizer.account_id.clone())
      .with_static_gas(AML_CHECK_GAS)
      .get_address(account_id.clone())
      .then(
        ext_self::ext(env::current_account_id())
          .with_unused_gas_weight(u64::MAX)
          .allowlist_callback(account_id),
      )
  }

  /// Callback after checking AML score for account
  /// Is risk score is below threshold, add to allowlist
  /// Otherwise panic
  #[private]
  pub fn allowlist_callback(
    &mut self,
    #[callback_unwrap] security_score: CategoryRisk,
    account_id: AccountId,
  ) -> PromiseOrValue<()> {
    let (category, risk) = security_score;

    if self.authorizer.assert_risk((category.clone(), risk)) {
      let account_hash = account_hash(&account_id, self.allowlist.field_size);

      let index = self.allowlist.current_insertion_index;

      event_allowlist_update(
        self.allowlist.event_count,
        index,
        account_hash,
        account_id,
        true,
      );
      self.allowlist.add_to_allowlist(account_hash);
      PromiseOrValue::Value(())
    } else {
      event_allowlist_denied(
        account_id,
        json!(category),
        risk,
        self.authorizer.get_category(&category)
      );
      PromiseOrValue::Promise(
        Promise::new(env::signer_account_id())
          .transfer(ALLOWLIST_STORAGE_COST)
          .then(
            ext_self::ext(env::current_account_id())
              .with_unused_gas_weight(u64::MAX)
              .panic_callback(Some(format!(
                "Account risk is too high: category {:?}, account risk is {}, limit is {}",
                category,
                risk,
                self.authorizer.get_category(&category)
              ))),
          ),
      )
    }
  }

  /// Perform cross contract call to check accounts risk score with AML provider
  /// Callback should process the score and add user to denylist if score is above threshold
  /// This method can be called by anyone that wants to block a malicious account from the platform
  /// In practice, incentives must be created to foster this behavior.
  /// Method panics if an account_id that is not in allowlist is passed. That is
  /// because there is no pratical reason to denylist accounts that cannot deposit and
  /// not allowing them protects the contract from storage consumption attacks
  #[payable]
  pub fn denylist(&mut self, account_id: AccountId) -> Promise {
    assert_eq!(
      env::attached_deposit(),
      DENYLIST_STORAGE_COST,
      "Must attach a deposit of exactly {} yoctoNEAR to cover storage costs",
      DENYLIST_STORAGE_COST
    );
    assert!(
      self
      .allowlist
      .is_in_allowlist(&account_hash(&account_id, self.allowlist.field_size)),
      "Account is not in allowlist, no need to denylist"
    );
    ext_aml::ext(self.authorizer.account_id.clone())
      .with_static_gas(AML_CHECK_GAS)
      .get_address(account_id.clone())
      .then(
        ext_self::ext(env::current_account_id())
          .with_unused_gas_weight(1)
          .denylist_callback(account_id),
      )
  }

  /// Callback after checking AML score for account
  /// If account is not in allowlist, do nothing (makes no difference to add it to denylist)
  /// Is risk score is above threshold and in allowlist, add to denylist
  /// Otherwise return funds and trigger callback panic
  #[private]
  pub fn denylist_callback(
    &mut self,
    #[callback_unwrap] security_score: CategoryRisk,
    account_id: AccountId,
  ) -> PromiseOrValue<()> {
    let (category, risk) = security_score;

    assert!(
      !self.authorizer.assert_risk((category.clone(), risk)),
      "Account risk is too low: category {:?}, account risk is {}, limit is {}",
      category,
      risk,
      self.authorizer.get_category(&category)
    );

    if !self.authorizer.assert_risk((category.clone(), risk)) {
      let account_hash = account_hash(&account_id, self.allowlist.field_size);

      let event_counter = self.allowlist.event_count;
      let index = self.allowlist.add_to_denylist(account_hash);

      if let Some(index) = index {
        event_allowlist_update(
          event_counter,
          index,
          self.allowlist.zeros(0),
          account_id,
          false,
        );
      }
      PromiseOrValue::Value(())
    } else {
      PromiseOrValue::Promise(
        Promise::new(env::signer_account_id())
          .transfer(DENYLIST_STORAGE_COST)
          .then(
            ext_self::ext(env::current_account_id())
              .with_unused_gas_weight(u64::MAX)
              .panic_callback(Some(format!(
                "Account risk is too low: category {:?}, account risk is {}, limit is {}",
                category,
                risk,
                self.authorizer.get_category(&category)
              ))),
          ),
      )
    }
  }

  /// Function to attach a final panic to cross contract calls
  /// This is necessary when we want to return attached funds to a user
  /// in a failed call but also want an error message to show in their wallet
  #[private]
  pub fn panic_callback(&mut self, message: Option<String>) {
    if let Some(message) = message {
      panic!("{}", message);
    }
  }
}
