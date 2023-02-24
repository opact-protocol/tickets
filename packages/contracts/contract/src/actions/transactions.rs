use near_sdk::{env, near_bindgen, AccountId, Promise, json_types::U128, is_promise_success};
use near_bigint::U256;
use near_plonk_verifier::{Proof, G1Point};

use crate::*;

const ALLOWLIST_GAS: Gas = Gas(10_000_000_000_000);

#[near_bindgen]
impl Contract {
  /// Method used to deposit NEAR native to the contract
  /// this method can only be called if the HYC instance has been set to
  /// accept NEAR as its deposit token.
  /// When calling the method, caller must attach the exact NEAR amount found in
  /// self.deposit_value otherwise panics.
  /// Caller must be in registry allowlist to call this method - otherwise panics.
  /// secret_hash will be inserted into commitment merkle tree
  #[payable]
  pub fn deposit(&mut self, secrets_hash: U256) -> Promise {
    assert!(
      self.currency.is_near(),
      "contract does not accept NEAR token"
    );
    let user_account = env::predecessor_account_id();
    ext_registry::ext(self.registry.clone())
      .with_static_gas(ALLOWLIST_GAS)
      .view_is_in_allowlist(user_account.clone())
      .then(
        ext_self::ext(env::current_account_id())
          .with_unused_gas_weight(u64::MAX)
          .inner_deposit(secrets_hash, env::attached_deposit(), user_account),
      )
  }

  /// Method used to deposit NEP-141 tokens to the contract.
  /// This method can only be called if the HYC instance has been set to
  /// accept an NEP-141 token as its deposit token. The method also validates if
  /// the correct token was sent.
  /// This method can only be called by the NEP-141 token as a callback to ft_transfer_call
  /// for more details in the implementation refer to NEP-141 docs.
  /// When calling ft_transfer_call, caller must send the exact token amount found in
  /// self.deposit_value otherwise panics. Caller must also pass the secrets_hash as msg.
  /// Caller must be in registry allowlist to call this method - otherwise panics.
  /// msg (secret_hash) will be inserted into commitment merkle tree
  pub fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: U256) -> Promise {
    assert!(
      self.currency.is_nep_141(env::predecessor_account_id()),
      "This contract does not accept this token"
    );
    ext_registry::ext(self.registry.clone())
      .with_static_gas(ALLOWLIST_GAS)
      .view_is_in_allowlist(sender_id.clone())
      .then(
        ext_self::ext(env::current_account_id())
          .with_unused_gas_weight(u64::MAX)
          .inner_deposit(msg, amount.0, sender_id),
      )
  }

  /// Callback method on deposits after evaluating if depositor is in allowlist
  /// If depositor is found to be in allowlist, processes deposit.
  /// If depositor is not in allowlist, panics.
  #[private]
  pub fn inner_deposit(
    &mut self,
    #[callback_unwrap] is_in_allowlist: bool,
    secrets_hash: U256,
    attached_deposit: u128,
    account_id: AccountId,
  ) -> U128 {
    let deposit_value = self.deposit_value;
    assert_eq!(
      attached_deposit, deposit_value,
      "deposited values must be exactly {}",
      deposit_value
    );

    assert!(!self.kill_switch, "kill_switch was triggered");
    assert!(is_in_allowlist, "account is not registered in allowlist");

    let commitment = serial_hash(secrets_hash, account_hash(&account_id, self.verifier.q), self.verifier.q);
    let index = self.commitments.current_insertion_index;
    self.commitments.insert(commitment);

    event_deposit(index, commitment);
    U128(0)
  }

  /// Method used to submit ZK proof to contract to withdraw funds
  /// Can be submitted by any user. However, all public args used -
  /// that is root, nullifier_hash, recipient, relayer, fee, refund and allowlist_root
  /// must be the same as the arguments used to generate the ZK proof.
  /// Refer to circom and snarkjs docs for more information on generating ZK proofs.
  /// allowlist_root is checked to be valid against the registry contract.
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
    

    ext_registry::ext(self.registry.clone())
      .with_static_gas(ALLOWLIST_GAS)
      .view_is_allowlist_root_valid(allowlist_root)
      .then(
        ext_self::ext(env::current_account_id())
          .with_unused_gas_weight(u64::MAX)
          .withdraw_check_callback(nullifier_hash, recipient, relayer, fee, refund)
      )
  }

  /// Callback performed after calling view_is_allowlist_root_valid on register contract
  /// if allowlist_root sent is valid, add nullifer to nullifier_set and performs token transfer
  #[private]
  pub fn withdraw_check_callback(
    &mut self,
    #[callback_unwrap] is_allowlist_root_valid: bool,
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
  ) -> Promise {
    assert!(
      is_allowlist_root_valid,
      "allowlist root informed is invalid"
    );

    self.nullifier.insert(&nullifier_hash);

    // promise is first built transferring value to user and calling callback to handle failure
    // Transfers to owner and relayer are attached after it so that they don't get processed in case of failures
    // Owner and Relayer are assumed to be registered in contract. Failures in transfers will not be reverted
    self
      .currency
      .transfer(
        recipient.clone(),
        self.deposit_value - self.protocol_fee - fee.as_u128(),
      )
      .then(
        ext_self::ext(env::current_account_id())
          .with_unused_gas_weight(u64::MAX)
          .withdraw_transfer_callback(nullifier_hash, recipient, relayer, fee, refund),
      )
  }

  /// Callback performed after transferring funds
  /// if fund transfer fails for whatever reason, reverts state changes from transaction
  /// else emits event and sends fees to relayer and owner
  #[private]
  pub fn withdraw_transfer_callback(
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
  /// Internal method that evaluates:
  /// (1) if public params are within accepted boundaries
  /// (2) if ZK proof is valid
  /// This method however does NOT evaluate if the allowlist_root is a valid
  /// root. This can only be evaluated through a cross contract call to the registry contract.
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
    // assert!(
    //   self.allowlist.is_known_valid_root(allowlist_root),
    //   "allowlist tree root is invalid"
    // );

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
