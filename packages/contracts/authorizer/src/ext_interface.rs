use crate::*;
use near_sdk::ext_contract;

#[ext_contract(ext_transactions_contract)]
pub trait TransactionsContract {
  fn whitelist(account: AccountId);
}
