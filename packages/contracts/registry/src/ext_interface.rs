use crate::*;

#[ext_contract(ext_self)]
pub trait SelfContract {
    fn allowlist_callback(account_id: AccountId);
    fn denylist_callback(account_id: AccountId);
}

#[ext_contract(ext_aml)]
pub trait ExtAmlContract {
    fn get_address(&self, address: AccountId) -> CategoryRisk;
}