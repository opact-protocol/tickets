use crate::*;
use crate::serial_hasher::serial_hash;

#[near_bindgen]
impl Contract {
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
      fee < U256::from_dec_str(&self.value_of_deposit.0.to_string()).unwrap(),
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
      self.white_list.is_known_valid_root(whitelist_root),
      "whitelist tree root is invalid"
    );

    let recipient_hash = serial_hash(U256::zero(), recipient.to_string().as_str());
    let relayer_hash = serial_hash(U256::zero(), relayer.to_string().as_str());

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
    Promise::new(recipient).transfer(self.value_of_deposit.0 - fee.as_u128())
  }
}
