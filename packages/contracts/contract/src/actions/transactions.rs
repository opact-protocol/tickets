use near_sdk::{env, near_bindgen, AccountId, Promise};
use near_bigint::U256;
use rust_verifier::Proof;

use crate::{
  Contract, ContractExt,
  hashes::{account_hash, serial_hash},
  events::{event_deposit, event_withdrawal},
};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn deposit(&mut self, secrets_hash: U256) {
    let deposit_value = self.deposit_value;
    assert_eq!(env::attached_deposit(), deposit_value, "deposited values must be exactly {} NEAR", deposit_value);

    let account_id = env::predecessor_account_id();
    let account_hash = account_hash(&account_id);
    assert!(self.whitelist.is_in_whitelist(&account_hash));

    let commitment = serial_hash(secrets_hash, account_hash);
    self.commitments.insert(commitment);

    event_deposit(account_id, deposit_value);
  }

  pub fn withdraw(
    &mut self,
    root: U256,
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: AccountId,
    fee: U256,
    refund: U256,
    whitelist_root: U256,
    proof: Proof,
  ) -> Promise {
    assert!(
      fee < U256::from_dec_str(&self.deposit_value.to_string()).unwrap(),
      "fee cannot be greater than deposit value"
    );
    assert!(
      !self.nullifier.contains(&nullifier_hash),
      "nullifier was already used"
    );
    assert!(
      self.commitments.is_known_valid_root(root),
      "commitment tree root is invalid"
    );
    assert!(
      self.whitelist.is_known_valid_root(whitelist_root),
      "whitelist tree root is invalid"
    );

    let recipient_hash = account_hash(&recipient);
    let relayer_hash = account_hash(&relayer);

    assert!(
      self.verifier.verify(
        vec![
          root,
          nullifier_hash,
          recipient_hash,
          relayer_hash,
          fee,
          refund,
          whitelist_root
        ],
        proof
      ),
      "proof submited is invalid"
    );

    self.nullifier.insert(&nullifier_hash);
    event_withdrawal(nullifier_hash);

    if fee > U256::zero() {
      Promise::new(relayer).transfer(fee.as_u128());
    }

    Promise::new(recipient).transfer(self.deposit_value - fee.as_u128())
  }
}
