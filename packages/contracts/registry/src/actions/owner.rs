use crate::*;

#[near_bindgen]
impl Contract {
  /// Method to add a new HYC instance to the registry
  /// Must specify address of new instance, currency and amount supported by the instance.
  /// Call does not validate address' supported currency and amount.
  /// If there is already a registered instance for the specified currency and amount, it will be replaced -
  /// the replaced instance is still going to be in the contract allowlist, so that users can withdraw their deposits.
  /// Only callable by contract owner.
  #[payable]
  pub fn add_entry(&mut self, currency: Currency, amount: U256, account_id: AccountId) {
    self.only_owner();
    let mut amount_map = self.currencies_map.get(&currency).unwrap_or(HashMap::new());
    amount_map.insert(amount, account_id.clone());
    self.currencies_map.insert(&currency, &amount_map);
    self.contracts_allowlist.insert(&account_id);
  }

  /// Method to remove a HYC instance from the registry
  /// Must specify currency and amount.
  /// Panics if there is no contract registered for the specified currency and amount.
  /// Entry is removed from currencies_map - meaning that it will not be accessible to new deposits - 
  /// however it is not removed from contracts_allowlist - meaning that withdraws can still be done through relayers.
  /// Only callable by contract owner.
  #[payable]
  pub fn remove_entry(&mut self, currency: Currency, amount: U256) {
    self.only_owner();
    let mut amount_map = self
      .currencies_map
      .get(&currency)
      .expect("Currency is not registered");
    amount_map
      .remove(&amount)
      .expect("Amount was not registered for this currency");
    if amount_map.len() == 0 {
      self.currencies_map.remove(&currency);
    } else {
      self.currencies_map.insert(&currency, &amount_map);
    }
  }

  /// DANGEROUS METHOD
  /// Removes a HYC contract instance from allowlist.
  /// This means users will NOT be able to withdraw from the removed HYC contract with relayers.
  /// Does not validate if contract was removed from currencies_map
  /// Only use in cases where a contract need to be invalidated.
  #[payable]
  pub fn remove_from_allowlist(&mut self, account_id: AccountId) {
    self.only_owner();
    self.contracts_allowlist.remove(&account_id);
  }

}
