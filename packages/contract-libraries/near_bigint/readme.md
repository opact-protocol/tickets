<div align="center">

  <h1><code>near-bigint</code></h1>

  <p>
    <strong>Rust library to use Big Integer types in NEAR Protocol Smart Contract development.</strong>
  </p>

</div>

## Use cases
Smart contracts in the NEAR Blockchain are limited by the native rust data type. This means developers can represent integer numbers up to 128 bits using the `u128` type.

However, when dealing with blockchain financial applications, it is often possible that larger numbers might need to be represented. For instance, the solidity language in the Ethereum ecosystem supports up to 256 bits nativelly, translating solidity apps to NEAR naively can easily lead to integer overflow errors.

A common solution to the problem has been to use well known rust packages that implement big integer arithmetics as dependencies to implement bigger integer types, such as [uint](https://crates.io/crates/uint).

These libraries work well and allow developers to safely use big integer arithmetics within NEAR smart contract applications, however, they lack the ergonomics necessary to work within the NEAR environment. Such required features are:
1. Borsh serialization and deserialization -> Allows values to be stored directly into the blockchain's state without needing to convert it to a binary representation
2. Serde serialization and deserialization -> Allows values to be passed as function arguments when calling public methods in the smart contract
3. StorageKey serialization -> Allows values to be used as keys within th blockchain's trie

We chose to implement these features on top of the [uint](https://crates.io/crates/uint) library, which is used by top NEAR projects such as [ref.finance](https://www.ref.finance/). Besides implementing the aforementioned features, we also added a more ergonomic API to:
1. Convert big integer format to u128 and panic if number does not fit
2. Convert big integer format to little or big endian bytes
3. Generate empty buffer values for big integer initialization

## How to use
There are 2 ways to use the library:
1. Import pre constructed types
2. Import macro to build Big Integer types of any size

The library nativelly exports types for big integers of 256, 384, 512, 640, 768, 896 and 1024 bits.
```rust
use near_bigint::{U256, U384, U512, /* ... */};
```

If you need a type with a different bit size, you can construct your own using the `construct_near_bigint` macro. This allows you to build types of any size that is a multiple of 64 bits.
```rust
use near_bigint::construct_near_bigint;

/// You need to declare a name for the type you're creating - U{bit size} is recommended
/// You also need to declare the intended bit size (as a multiple of 64)
/// construct_near_bigint!(pub struct {type name}({multiple of 64 bitsize}););

construct_near_bigint!(pub struct U2048(32););
construct_near_bigint!(pub struct U192(3););

let u2048_var = U2048::from_dec_str("100").unwrap();
let u192_var = U192::from_dec_str("100").unwrap();
```

## API and examples
All types contructed with this library inherit the API from the [uint](https://crates.io/crates/uint) library. This can be found in their documentation and will not be reproduced here.

All near-bigint types are borsh serializable and deserializable, which means you can store them directly into the contract's state:
```rust
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, Promise};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupSet};
use near_bigint::U256;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub owner: AccountId,
  pub guardian: LookupSet<AccountId>,
  pub deposit_value: U256,
  pub deposited_valeus: LookupSet<U256>,
}
```

Types are also serde serializable/deserializable, meaning they can be used as argument or return types in public methods. The end users must then pass the values as strings in their front-end application (the same way that near_sdk::json_types::{U128, U64} work).
```rust
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, Promise};
use near_bigint::U256;
use crate::Contract;

#[near_bindgen]
impl Contract {

    pub fn public_method(&mut self, number: U256) {
        self.deposit_value = number;
    }

}
```

Finally, types can also be used as storage keys in the trie:
```rust
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, BorshStorageKey, Promise};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap};
use near_bigint::U256;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub owner: AccountId,
  /// Bigint used as storage key here
  pub map: LookupMap<U256, AccountId>,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(
    owner: AccountId,
    initial_key: U256
  ) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );

    /// Bigint used as storage key here
    let mut map = LookupMap::new(initial_key);

    /// Bigint used as storage key here
    map.insert(&U256::from_dec_str("0").unwrap(), &owner);

    Self {
      owner,
      map,
    };
  }
}
```

Some utilities are also implemented to improve ergonomy:
```rust
use near_bigint::U256;

let sample_var = U256::from_dec_str("5165164138").unwrap();

/// Convert to big endian bytes
let big_endian: [u8; 256] = sample_var.to_be_bytes();

/// Convert to little endian bytes
let little_endian: [u8; 256] = sample_var.to_le_bytes();

/// Get bytes equivalent to 0 value
let 0_bytes: [u8; 256] = U256::empty_buffer();

/// Convert to u128 (panics in case big number overflows 128 bits)
let 128_bits: u128 = sample_var.as_u128(); 

```

## Supported near-sdk versions
near-bigint is built on top of near-sdk 4.0.0 and will be updated periodically to reflect updates on near-sdk. Previous near-sdk versions are not compatible with this library.