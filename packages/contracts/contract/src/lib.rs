use merkle_tree::commitment_tree::MerkleTree;
use merkle_tree::allowlist_tree::AllowlistMerkleTree;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey};
use near_sdk::collections::{LookupSet};
use near_groth16_verifier::{self, Verifier};
use near_bigint::U256;
use hapi_near_connector::aml::*;

use events::*;

mod actions;
mod events;
mod hashes;
mod merkle_tree;
mod ext_interface;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub owner: AccountId,
  pub kill_switch: bool,
  // hapi.one contract's account 
  pub authorizer: AML,
  pub max_risk: u8,
  pub commitments: MerkleTree,

  pub allowlist: AllowlistMerkleTree,
  pub deposit_value: u128,
  pub verifier: Verifier,
  pub nullifier: LookupSet<U256>,
}

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  Authorizer,
  Nullifier,
  // merkle tree keys
  FilledSubtreesPrefix,
  LastRootsPrefix,
  ZeroValuesPrefix,
  PreviousCommitmentsPrefix,
  // allow list keys
  DataStorePrefix,
  DataLocationsPrefix,
  LastRootsPrefixWL,
  DenylistSetPrefix,
  ZeroValuesPrefixWL,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(
    owner: AccountId,
    authorizer: AccountId,
    max_risk: u8,
    // merkle tree params
    height: u64,
    last_roots_len: u8,
    field_size: U256, // it's the same for wl
    zero_value: U256,
    // wl params
    height_wl: u64,
    last_roots_len_wl: u8,
    deposit_value: U128,
    // verifier
    verifier: Verifier,
  ) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );
    Self {
      owner,
      kill_switch: false,
      authorizer: AML::new(authorizer, max_risk),
      max_risk,
      commitments: MerkleTree::new(
        height,
        last_roots_len,
        StorageKey::FilledSubtreesPrefix,
        StorageKey::LastRootsPrefix,
        StorageKey::ZeroValuesPrefix,
        StorageKey::PreviousCommitmentsPrefix,
        field_size,
        zero_value,
      ),
      allowlist: AllowlistMerkleTree::new(
        height_wl,
        last_roots_len_wl,
        StorageKey::DataStorePrefix,
        StorageKey::DataLocationsPrefix,
        StorageKey::LastRootsPrefixWL,
        StorageKey::DenylistSetPrefix,
        StorageKey::ZeroValuesPrefixWL,
        field_size,
        zero_value,
      ),
      deposit_value: deposit_value.0,
      verifier,
      nullifier: LookupSet::new(StorageKey::Nullifier),
    }
  }
}

impl Contract {
  pub fn only_owner(&self) {
    assert_eq!(
      env::predecessor_account_id(),
      self.owner,
      "This function is restricted to the owner"
    );
  }
}

#[cfg(test)]
mod tests {
  pub use near_sdk::collections::LazyOption;
  pub use near_sdk::mock::VmAction;
  pub use near_sdk::serde_json::{self, json};
  pub use near_sdk::test_utils::{get_created_receipts, get_logs};
  pub use near_sdk::{testing_env, Balance, Gas, MockedBlockchain, VMContext};
  pub use near_sdk::{PromiseResult, RuntimeFeesConfig, VMConfig};

  pub use rstest::{fixture, rstest};

  pub use std::collections::HashMap;
  pub use std::convert::{TryFrom, TryInto};
  pub use std::panic::{catch_unwind, UnwindSafe};
  pub use std::str::from_utf8;

  pub use super::*;

  /// Mocked contract account id
  pub const CONTRACT_ACCOUNT: &str = "contract.testnet";
  pub const AUTHORIZER_ACCOUNT: &str = "authorizer.testnet";
  /// Mocked owner account id
  pub const OWNER_ACCOUNT: &str = "owner.testnet";
  /// Mocked regular user account id
  pub const USER_ACCOUNT: &str = "user.testnet";

  /// Initializes mocked blockchain context
  pub fn get_context(
    input: Vec<u8>,
    attached_deposit: u128,
    account_balance: u128,
    signer_id: AccountId,
    block_timestamp: u64,
    prepaid_gas: Gas,
  ) -> VMContext {
    VMContext {
      current_account_id: CONTRACT_ACCOUNT.parse().unwrap(),
      signer_account_id: signer_id.clone(),
      signer_account_pk: vec![0; 33].try_into().unwrap(),
      predecessor_account_id: signer_id.clone(),
      input,
      block_index: 0,
      block_timestamp,
      account_balance,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit,
      prepaid_gas,
      random_seed: [0; 32],
      view_config: None,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }

  fn get_next_storage_key(hash: U256) -> U256 {
    U256::from_little_endian(&env::keccak256_array(&hash.to_le_bytes()))
  }

  /// Initializes contract with random seed as storage keys to
  /// guarantee no collisions
  pub fn init_contract(seed: u128) -> Contract {
    let seed = U256::from_little_endian(&seed.to_be_bytes());
    let hash1 = get_next_storage_key(seed);
    let hash2 = get_next_storage_key(hash1);
    let hash3 = get_next_storage_key(hash2);
    let hash4 = get_next_storage_key(hash3);
    let hash5 = get_next_storage_key(hash4);
    let hash6 = get_next_storage_key(hash5);
    let hash7 = get_next_storage_key(hash6);
    let hash8 = get_next_storage_key(hash7);
    let hash9 = get_next_storage_key(hash8);
    let hash10 = get_next_storage_key(hash9);
    let hash11 = get_next_storage_key(hash10);
    let hash12 = get_next_storage_key(hash11);

    let field_size = U256::from_dec_str(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617",
    )
    .unwrap();
    let zero_value = U256::from_dec_str("").unwrap();

    Contract {
      owner: OWNER_ACCOUNT.parse().unwrap(),
      kill_switch: false,
      authorizer: AML::new(AUTHORIZER_ACCOUNT.parse().unwrap(), MAX_RISK_LEVEL/2),
      max_risk: MAX_RISK_LEVEL/2,
      commitments: MerkleTree::new(20, 20, hash3, hash4, hash5, hash12, field_size, zero_value),
      allowlist: AllowlistMerkleTree::new(
        20, 20, hash6, hash7, hash8, hash9, hash10, field_size, zero_value,
      ),
      deposit_value: 20000000000000000000000000,
      verifier: Verifier::new(
        near_groth16_verifier::G1Point {
          x: U256::from_dec_str(
            "11929434009103390266755415091858623822884685127957621260775374579078909737674",
          )
          .unwrap(),
          y: U256::from_dec_str(
            "11068084853340904043186348227688297612169140696215318326919782966060881527637",
          )
          .unwrap(),
        },
        near_groth16_verifier::G2Point {
          x: [
            U256::from_dec_str(
              "12329300379284736487759277870289591812325857359120129210116695958510025528558",
            )
            .unwrap(),
            U256::from_dec_str(
              "405103167280479565761562144537635617063562368060534814239209215321256266140",
            )
            .unwrap(),
          ],
          y: [
            U256::from_dec_str(
              "11190969014479503631176203693358577894804923600122382113070408317153327961174",
            )
            .unwrap(),
            U256::from_dec_str(
              "12169250944775138496715645948096141163163222170597888800716258068649996251897",
            )
            .unwrap(),
          ],
        },
        near_groth16_verifier::G2Point {
          x: [
            U256::from_dec_str(
              "10857046999023057135944570762232829481370756359578518086990519993285655852781",
            )
            .unwrap(),
            U256::from_dec_str(
              "11559732032986387107991004021392285783925812861821192530917403151452391805634",
            )
            .unwrap(),
          ],
          y: [
            U256::from_dec_str(
              "8495653923123431417604973247489272438418190587263600148770280649306958101930",
            )
            .unwrap(),
            U256::from_dec_str(
              "4082367875863433681332203403145435568316851327593401208105741076214120093531",
            )
            .unwrap(),
          ],
        },
        near_groth16_verifier::G2Point {
          x: [
            U256::from_dec_str(
              "5790202932707851834971338329931905576169490530124069101001782500222600854667",
            )
            .unwrap(),
            U256::from_dec_str(
              "14948968581672768531234399884275269144859974027397561018343232479343421127230",
            )
            .unwrap(),
          ],
          y: [
            U256::from_dec_str(
              "10336507888871439774654247008473901721063319537508224631564880035016520689734",
            )
            .unwrap(),
            U256::from_dec_str(
              "9856599487216717989610058910919798666517375961900162444491443343101268985449",
            )
            .unwrap(),
          ],
        },
        vec![
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "10558925288976907965469300478434171166775183168644571041226339931044639838584",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "2561981498437337100558731678149702647801128505609318505259938216989529526583",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "8692640465836940407247076561528588802257111263627111557005104421314190010881",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "1492817016321743921111533287773482629323490494560752468008119668502178842957",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "9015295882064685058646324579770369169624639664495134765302964899445979537974",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "9220238172256923283206443173669350824409336506344747783997179667821109845937",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "2680708481975690632841888313988626621815593840420314570935868033529951064689",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "2428212461168282306651389254055425154125555233810089742483138937711829274770",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "21646405787355360791256498679491825515973450327612830612936932142232629913707",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "15404896862389849666318248755422192986896025439607580119236344479246185994127",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "7326800130457667302128074678103962581759337277766929222842481653542128159923",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "17556940140161222241436428793839198285369063812134558716647967460395775065825",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "19217544629750115119592690785243318580209244929795854424339912058683641377341",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "5275743184122146803743646574109679197034814281423391774005054020728907444825",
            )
            .unwrap(),
          },
          near_groth16_verifier::G1Point {
            x: U256::from_dec_str(
              "626944075200141454123327199571007123899735939592938593344851156659404091574",
            )
            .unwrap(),
            y: U256::from_dec_str(
              "15292655118984704290635080824856783361562663820634332747656851161472762170700",
            )
            .unwrap(),
          },
        ],
      ),
      nullifier: LookupSet::new(hash11),
    }
  }

  // #[rstest]
  // fn test_new() {
  //     let context = get_context(
  //         vec![],
  //         0,
  //         0,
  //         OWNER_ACCOUNT.parse().unwrap(),
  //         0,
  //         Gas(300u64 * 10u64.pow(12)),
  //     );
  //     testing_env!(context);

  //     let contract = Contract::new(
  //         OWNER_ACCOUNT.parse().unwrap(),
  //         TOKEN_SUPPLY,
  //         REWARDS_TOKEN_ACCOUNT.parse().unwrap(),
  //         "NAME_HERE".to_string(),
  //         "SYMBOL_HERE".to_string(),
  //         Some("ICON_HERE".to_string()),
  //         "REFERENCE_HERE".to_string(),
  //         "NFT_NAME_HERE".to_string(),
  //         "NFT_DESC_HERE".to_string(),
  //         "NFT_MEDIA_HERE".to_string(),
  //     );

  //     assert_eq!(
  //         TOKEN_SUPPLY,
  //         contract
  //             .ft_functionality
  //             .ft_balance_of(OWNER_ACCOUNT.parse().unwrap())
  //     );
  // }
}
