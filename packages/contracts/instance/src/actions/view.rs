use crate::*;
use near_bigint::U256;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ContractParams {
  owner: AccountId,
  kill_switch: bool,
  currency: Currency,
  deposit_value: U128,
  protocol_fee: U128,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ContractParams {
  owner: AccountId,
  kill_switch: bool,
  authorizer: (AccountId, Vec<(Category, RiskScore)>),
  currency: Currency,
  deposit_value: U128,
  protocol_fee: U128,
}

#[near_bindgen]
impl Contract {
  /// Returns the MiMC hash of the account
  pub fn view_account_hash(&self, account_id: AccountId) -> U256 {
    account_hash(&account_id, self.verifier.q)
  }

  /// Returns the MiMC hash of the nullifier sent
  pub fn view_nullifier_hash(&self, nullifier: U256) -> U256 {
    u256_mimc_sponge_single(U256::zero(), [nullifier])[0]
  }

  /// Returns current root of the commitments merkle tree
  pub fn view_commitments_root(&self) -> U256 {
    self.commitments.get_last_root()
  }

  /// Check if a nullifier was already spent
  /// nullifier param actually takes the MiMC hash of the nullifier
  pub fn view_was_nullifier_spent(&self, nullifier: U256) -> bool {
    self.nullifier.contains(&nullifier)
  }

  /// Returns current value of kill_swithc variable
  /// if it is true, no new deposits can be made to this contract
  pub fn view_kill_switch(&self) -> bool {
    self.kill_switch
  }

  /// Returns serialized object containing all contract variables
  pub fn view_contract_params(&self) -> ContractParams {
    ContractParams {
      owner: self.owner.clone(),
      kill_switch: self.kill_switch,
      currency: self.currency.clone(),
      deposit_value: U128(self.deposit_value),
      protocol_fee: U128(self.protocol_fee),
    }
  }

  /// Evaluates if given withdraw parameters are valid. This can
  /// be used by relayers to check if a relay request made to them is
  /// legitimate or malicious.
  /// Checks:
  /// (1) whether ZK proof is valid with public parameters
  /// (2) if public parameters are valid
  /// Does NOT check if allowlist_root is valid. This must be checked
  /// in registry contract by calling `view_is_allowlist_root_valid`
  pub fn view_is_withdraw_valid(
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
  ) -> bool {
    self.evaluate_proof(
      root,
      nullifier_hash,
      recipient,
      relayer,
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
    true
  }
}
