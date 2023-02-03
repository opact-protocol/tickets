use near_sdk::{env, near_bindgen, AccountId, Promise};
use near_bigint::U256;
use near_plonk_verifier::{Proof, G1Point};

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

    assert!(!self.kill_switch, "kill_switch was triggered");

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
    // proof params
    a: G1Point,
    b: G1Point,
    c: G1Point,
    z: G1Point,
    t_1: G1Point,
    t_2: G1Point,
    t_3: G1Point,
    eval_a: U256,
    eval_b: U256,
    eval_c: U256,
    eval_s1: U256,
    eval_s2: U256,
    eval_zw: U256,
    eval_r: U256,
    wxi: G1Point,
    wxi_w: G1Point,
  ) -> Promise {
    self.evaluate_proof(
      root,
      nullifier_hash,
      recipient.clone(),
      relayer.clone(),
      fee,
      refund,
      allowlist_root,
      a,
      b,
      c,
      z,
      t_1,
      t_2,
      t_3,
      eval_a,
      eval_b,
      eval_c,
      eval_s1,
      eval_s2,
      eval_zw,
      eval_r,
      wxi,
      wxi_w,
    );

    self.nullifier.insert(&nullifier_hash);
    event_withdrawal(
      self.nullifier_count,
      recipient.clone(),
      relayer.clone(),
      fee,
      refund,
      nullifier_hash,
    );

    self.nullifier_count += 1;

    if let Some(relayer_account) = relayer {
      if fee > U256::zero() {
        Promise::new(relayer_account).transfer(fee.as_u128());
      }
    }

    Promise::new(recipient).transfer(self.deposit_value - fee.as_u128())
  }
}

impl Contract {
  pub fn evaluate_proof(
    &self,
    root: U256,
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
    allowlist_root: U256,
    // proof params
    a: G1Point,
    b: G1Point,
    c: G1Point,
    z: G1Point,
    t_1: G1Point,
    t_2: G1Point,
    t_3: G1Point,
    eval_a: U256,
    eval_b: U256,
    eval_c: U256,
    eval_s1: U256,
    eval_s2: U256,
    eval_zw: U256,
    eval_r: U256,
    wxi: G1Point,
    wxi_w: G1Point,
  ) {
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

    match relayer.clone() {
      Some(relayer_account) => {
        relayer_hash = account_hash(&relayer_account);
      }
      None => {
        relayer_hash = U256::zero();
        if fee > U256::zero() {
          panic!("Fee cannot be greater than 0 if there is no relayer");
        }
      }
    }

    assert!(
      self.verifier.verify(Proof {
        public_values: vec![
          root,
          nullifier_hash,
          recipient_hash,
          relayer_hash,
          fee,
          refund,
          allowlist_root
        ],
        a,
        b,
        c,
        z,
        t_1,
        t_2,
        t_3,
        eval_a,
        eval_b,
        eval_c,
        eval_s1,
        eval_s2,
        eval_zw,
        eval_r,
        wxi,
        wxi_w,
      }),
      "proof submited is invalid"
    );
  }
}
