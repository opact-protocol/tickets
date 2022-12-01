<div align="center">

  <h1><code>near-mimc</code></h1>

  <p>
    <strong>Rust library to use MiMC Hash function in NEAR Protocol Smart Contract development.</strong>
  </p>

</div>

## Use cases
This library was created as an implementation of the MiMC Hash function that can run within a NEAR Protocol Smart Cotnract. 

It is fully compatible (i.e. implemented in the exact same way) as in circom2 sample circuits. This allows the hash function to be used within zkSNARK schemes based on [snarky.js](https://github.com/o1-labs/snarkyjs) and [circom](https://docs.circom.io/).

## Supported near-sdk versions
near-bigint is built on top of near-sdk 4.0.0 and will be updated periodically to reflect updates on near-sdk. Previous near-sdk versions are not compatible with this library.

Additionally, the function interfaces utilize big integer types from the near-bigint library version 1.0.0.

## How to use it
The lbrary exposes 2 different hash functions, one taking 2 input values and the other taking a single value.
```rust
pub fn u256_mimc_sponge(k: U256, inputs: [U256; INPUTS]) -> [U256; OUTPUTS]

pub fn u256_mimc_sponge_single(k: U256, inputs: [U256; 1]) -> [U256; 1]
```
