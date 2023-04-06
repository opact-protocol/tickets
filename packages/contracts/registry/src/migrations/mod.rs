mod allowlist_tree_v1;

use crate::*;
use allowlist_tree_v1::AllowlistMerkleTreeV1;

#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct ContractV1 {
  // account that is authorized to modify registry
  pub owner: AccountId,
  // map of current production contracts for HYC in different currencies / deposit values
  pub currencies_map: UnorderedMap<Currency, HashMap<U256, AccountId>>,
  // Set of allowlisted contracts that relayers may trust to service
  pub contracts_allowlist: UnorderedSet<AccountId>,
  // hapi.one contract connector
  pub authorizer: AML,
  // merkle tree containing all authorized accounts after AML
  pub allowlist: AllowlistMerkleTreeV1,
}

#[near_bindgen]
impl Contract {
    #[init(ignore_state)]
    pub fn migrate_v1() -> Self {
        let old_contract: ContractV1 = env::state_read().expect("failed");

        Self {
            // account that is authorized to modify registry
            owner: old_contract.owner,
            // map of current production contracts for HYC in different currencies / deposit values
            currencies_map: old_contract.currencies_map,
            // Set of allowlisted contracts that relayers may trust to service
            contracts_allowlist: old_contract.contracts_allowlist,
            // hapi.one contract connector
            authorizer: old_contract.authorizer,
            // merkle tree containing all authorized accounts after AML
            allowlist: old_contract.allowlist.migrate(),
        }
    }
}
