use crate::*;

const FT_TRANSFER_GAS: Gas = Gas(40_000_000_000_000); 

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde", tag = "type")]
pub enum Currency {
  Near,
  Nep141 { account_id: AccountId },
}

#[ext_contract(ext_nep141)]
pub trait Nep141 {
  fn ft_transfer(receiver_id: String, amount: String, memo: Option<String>);
}

impl Currency {
  pub fn transfer(&self, receiver: AccountId, amount: u128) -> Promise {
    match self {
      Self::Near => Promise::new(receiver).transfer(amount),
      Self::Nep141 { account_id } => ext_nep141::ext(account_id.clone())
        .with_static_gas(FT_TRANSFER_GAS)
        .with_attached_deposit(1)
        .ft_transfer(receiver.to_string(), amount.to_string(), None)
    }
  }

  pub fn is_near(&self) -> bool {
    if let Self::Near = self {
      true
    } else {
      false
    }
  }

  pub fn is_nep_141(&self, contract_id: AccountId) -> bool {
    if let Self::Nep141 { account_id } = self {
      if account_id.clone() == contract_id {
        true
      } else {
        false
      }
    } else {
      false
    }
  }
}
