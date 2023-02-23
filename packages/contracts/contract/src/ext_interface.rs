use crate::*;

#[ext_contract(ext_self)]
pub trait SelfContract {
  fn allowlist_callback(account_id: AccountId);
  fn denylist_callback(account_id: AccountId);
  fn withdraw_callback(
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
  );
  fn withdraw_check_callback(
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
  );
  fn inner_deposit(secrets_hash: U256, attached_deposit: u128, account_id: AccountId) -> U128;
}

#[ext_contract(ext_registry)]
pub trait RegistryContract {
  /// Method to evaluate if an account is in allowlist in the registry contract
  fn view_is_in_allowlist(account_id: AccountId) -> bool;
  /// Method to evaluate if allowlist root used for proof is valid in registry contract
  fn view_is_allowlist_root_valid(root: U256) -> bool;
}
