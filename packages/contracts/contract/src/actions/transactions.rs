use near_sdk::{env, near_bindgen, AccountId, Promise};
use near_bigint::U256;
use near_groth16_verifier::Proof;

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
    assert_eq!(
      env::attached_deposit(),
      deposit_value,
      "deposited values must be exactly {} NEAR",
      deposit_value
    );

    let account_id = env::predecessor_account_id();
    let account_hash = account_hash(&account_id);
    assert!(self.allowlist.is_in_allowlist(&account_hash));

    let commitment = serial_hash(secrets_hash, account_hash);
    let index = self.commitments.current_insertion_index;
    self.commitments.insert(commitment);

    event_deposit(index, commitment);
  }

  pub fn withdraw(
    &mut self,
    root: U256,
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
    allowlist_root: U256,
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
      self.allowlist.is_known_valid_root(allowlist_root),
      "allowlist tree root is invalid"
    );

    let recipient_hash = account_hash(&recipient);

    let relayer_hash;

    match relayer {
      Some(relayer_account) => {
        relayer_hash = account_hash(&relayer_account);
        if fee > U256::zero() {
          Promise::new(relayer_account).transfer(fee.as_u128());
        }
      }
      None => {
        relayer_hash = U256::zero();
        if fee > U256::zero() {
          panic!("Fee cannot be greater than 0 if there is no relayer");
        }
      }
    }

    assert!(
      self.verifier.verify(
        vec![
          root,
          nullifier_hash,
          recipient_hash,
          relayer_hash,
          fee,
          refund,
          allowlist_root
        ],
        proof
      ),
      "proof submited is invalid"
    );

    self.nullifier.insert(&nullifier_hash);
    event_withdrawal(nullifier_hash);

    Promise::new(recipient).transfer(self.deposit_value - fee.as_u128())
  }
}
