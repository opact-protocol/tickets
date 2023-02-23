use crate::*;

#[near_bindgen]
impl Contract {

  /// Returns a Vec containing all currencies (token types) supported
  /// by HYC at the moment
  /// There is a known limitation to deserealizing large amounts of that
  /// HYC is inteded to support no more than 10 different currencies
  pub fn view_all_currencies(&self) -> Vec<Currency> {
    self.currencies_map.keys().collect()
  }

  /// Takes a currency struct as parameter
  /// Returns a HashMap with keys being all amounts supported for the currency and values
  /// as the HYC instance contracts that support those values
  /// There is a known limitation to deserealizing large amounts of that
  /// HYC is inteded to support no more than 10 different currencies
  pub fn view_currency_contracts(&self, currency: Currency) -> HashMap<U256, AccountId> {
    self.currencies_map.get(&currency).unwrap_or(HashMap::new())
  }

  /// Method to check if a contract is registered in the registry as a known HYC instance
  /// This method will be called by relayers before publishing transactions to check whether 
  /// the contract address informed by the user is a real HYC address that they can trust
  pub fn view_is_contract_allowed(&self, account_id: AccountId) -> bool {
    self.contracts_allowlist.contains(&account_id)
  }

  /// Returns all elements in allowlist. There is a know limitation to
  /// retrive large lists, however allowlist is not expected to ever exceed 100 elements
  pub fn view_contract_allowlist(&self) -> Vec<AccountId> {
    self.contracts_allowlist.to_vec()
  }

  /// Returns the current known allowlist root
  pub fn view_allowlist_root(&self) -> U256 {
    self.allowlist.get_last_root()
  }

  /// Method to evaluate if a given account is found in the allowlist
  /// Returns true if the account is in allowlist, false otherwise
  pub fn view_is_in_allowlist(&self, account_id: AccountId) -> bool {
    self.allowlist.is_in_allowlist(&account_hash(&account_id))
  }

  /// Method to evaluate if an allowlist root used to build a ZK proof is valid
  /// This method will be called as cross contract call by instances of HYC
  /// Returns true if valid, false otherwise
  pub fn view_is_allowlist_root_valid(&self, root: U256) -> bool {
    self.allowlist.is_known_valid_root(root)
  }
}
