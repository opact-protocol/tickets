use std::str::FromStr;

use near_sdk::{env, near_bindgen, AccountId, Promise, json_types::U128, is_promise_success};
use near_bigint::U256;
use near_plonk_verifier::{Proof, G1Point};

use crate::*;
use crate::{
  hashes::{account_hash, serial_hash},
  events::{event_deposit, event_withdrawal},
};

const CALLBACK_GAS: Gas = Gas(30_000_000_000_000);

#[ext_contract(ext_self)]
pub trait ExtSelf {
  fn withdraw_callback(
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
  );
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn deposit(&mut self, secrets_hash: U256) {
    assert!(
      self.currency.is_near(),
      "contract does not accept NEAR token"
    );
    self.inner_deposit(
      secrets_hash,
      env::attached_deposit(),
      env::predecessor_account_id(),
    );
  }

  pub fn ft_on_trasnfer(&mut self, sender_id: AccountId, amount: U128, msg: String) -> U128 {
    let secrets_hash =
      U256::from_str(&msg).expect("msg must be U256 number corresponding to secrets hash");
    assert!(
      self.currency.is_nep_141(env::predecessor_account_id()),
      "This contract does not accept this token"
    );
    self.inner_deposit(secrets_hash, amount.0, sender_id);
    U128(0)
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

    // promise is first built transferring value to user and calling callback to handle failure
    // Transfers to owner and relayer are attached after it so that they don't get processed in case of failures
    // Owner and Relayer are assumed to be registered in contract. Failures in transfers will not be reverted
    self
      .currency
      .transfer(recipient.clone(), self.deposit_value - fee.as_u128())
      .then(
        ext_self::ext(env::current_account_id())
          .with_static_gas(CALLBACK_GAS)
          .withdraw_callback(nullifier_hash, recipient, relayer, fee, refund),
      )
  }

  #[private]
  pub fn withdraw_callback(
    &mut self,
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
  ) {
    if is_promise_success() {
      event_withdrawal(
        self.nullifier_count,
        recipient.clone(),
        relayer.clone(),
        fee,
        refund,
        nullifier_hash,
      );
      self.nullifier_count += 1;

      // Owner and Relayer are assumed to be registered in contract. Failures in transfers will not be reverted
      if let Some(relayer_account) = relayer {
        if fee > U256::zero() {
          self.currency.transfer(relayer_account, fee.as_u128());
        }
      }
      if self.protocol_fee > 0 {
        self
          .currency
          .transfer(self.owner.clone(), self.protocol_fee);
      }
    } else {
      self.nullifier.remove(&nullifier_hash);
    }
  }
}

impl Contract {
  pub fn inner_deposit(
    &mut self,
    secrets_hash: U256,
    attached_deposit: u128,
    account_id: AccountId,
  ) {
    let deposit_value = self.deposit_value;
    assert_eq!(
      attached_deposit, deposit_value,
      "deposited values must be exactly {}",
      deposit_value
    );

    assert!(!self.kill_switch, "kill_switch was triggered");

    let account_hash = account_hash(&account_id);
    assert!(self.allowlist.is_in_allowlist(&account_hash));

    let commitment = serial_hash(secrets_hash, account_hash);
    let index = self.commitments.current_insertion_index;
    self.commitments.insert(commitment);

    event_deposit(index, commitment);
  }

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
    let deposit_value = U256::from_dec_str(&self.deposit_value.to_string()).unwrap();
    let protocol_fee = U256::from_dec_str(&self.protocol_fee.to_string()).unwrap();
    assert!(
      fee < (deposit_value - protocol_fee),
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

    let recipient_hash = account_hash(&recipient, self.verifier.q);

    let relayer_hash;

    match relayer.clone() {
      Some(relayer_account) => {
        relayer_hash = account_hash(&relayer_account, self.verifier.q);
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
