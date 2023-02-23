use near_sdk::{
    ext_contract,
    AccountId
};

#[ext_contract(ext_self)]
pub trait SelfContract {
    fn allowlist_callback(account_id: AccountId);
    fn denylist_callback(account_id: AccountId);
}