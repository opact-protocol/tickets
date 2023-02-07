# Hideyour.cash Smart Contract

The smart contract implements a zk transaction mixer on NEAR protocol that is nativelly integrated into [hapi.one's anti money laundering software](https://hapi.one/).

The contract support both NEAR native token and NEP-141 tokens. However, each instance of the contract can only support 1 token type and 1 fixed amount (example only deposits of 10 NEAR or only deposits of 30 USDC).

## Mixing logic

The contract provides anonimicity to users by leveraging a transaction mixer. Users can deposit funds with the deposit method and withdraw them from another account with the withdraw method by prociding a zk Proof of deposit.

The mechanism is based on tornado.cash's zk scheme with a twist that allows it to perform anti money laundery compliance.

## Anti money laundery

The anti money laundery scheme is powered by [hapi.one](https://hapi.one/).

Upon setting up the contract a max tolerated risk level is selected by the deployer. Accounts can only interact with the protocol if they present a risk level smaller thatn the max tolerated level.

To interact with the protocol for the first time, an account must be added to the whitelist. To require inclusion in the whitelist, a user must call `allowlist` and pass in their account id - the address will then be queried by hapi.one and, if it present a risk level below or equal to the threshold, the user will be included in the whitelist.

Once a user has been added to the whitelist, they may deposit funds into the protocol and other users may withdraw them. However, it is always possible for anyone (this will be done by robots in production and rewarded) to challange addresses that are in the whitelist, by performing new queries to hapi.one.
This is done through the `denylist` method. It will query the account passed into hapi.one and, should the risk be greater than the threshold the account will be added to the denylist and will not be able to deposit new funds nor withdraw previously deposited funds.

## API

### Allowlist methods

1. `allowlist`
params:
  - account_id: AccountId -> account that you want to add to allowlist

Panics if risk is too high,
Panics if account is already registered,
Adds account to allowlist otherwise

2. `denylist`
params:
  - account_id: AccountId -> account that you want to add to denylist

Panics if account risk is acceptable
Adds account to denylist otherwise

### Anonimity methods

1. `deposit`
params:
  - secrets_hash: U256 -> hash value of secret | nullifier according to circuit docs. Must be formatted as decimal number in string format

User calling this method must attach the NEAR amount corresponding to the contract's value. This only works if contract has been initialized using NEAR as its currency. Deposit value must be exactly the initialized value.

Panics if contract kill_switch is activated
Panics if user is not in whitelist
Inserts the commitment in the contract so that a withdraw can be made using the secrets

2. `ft_on_transfer`
params:
  - sender_id: AccountId -> Account that originally sent funds
  - amount: U128 -> Quantity of tokens sent. Must be exactly the value used when initializing the contract
  - msg: String -> hash value of secret | nullifier according to circuit docs. Must be formatted as decimal number in string format

This method will be called when using `ft_transfer_call` on the NEP-141 contract. For more information on `ft_transfer_call` mechanims (read the docs)[https://nomicon.io/Standards/Tokens/FungibleToken/Core#nep-141].

This method can only be called from the NEP-141 contract address passed when initializing the HYC contract. If you try to transfer any other token the call will panic.

Panics if contract kill_switch is activated
Panics if user is not in whitelist
Inserts the commitment in the contract so that a withdraw can be made using the secrets

3. `withdraw`
params:
  - root: U256 -> root value of commitment merkle tree used to build proof
  - nullifier_hash: U256 -> value of nullifier hash used to build proof
  - recipient: AccountId -> account that will receive withdrawn tokens
  - relayer: Option<AccountId> -> account of the relayer of the transaction - if used
  - fee: U256 -> quantity of tokens that will be sent to relayer as a fee
  - refund: U256 -> quantity of tokens that will be sent to relayer as refund for gas
  - whitelist_root: U256 -> root value of whitelist merkle tree used to build proof
  - a: G1Point -> A point component of proof,
  - b: G1Point -> B point component of proof,
  - c: G1Point -> C point component of proof,
  - z: G1Point -> Z point component of proof,
  - t_1: G1Point -> T1 point component of proof,
  - t_2: G1Point -> T2 point component of proof,
  - t_3: G1Point -> T3 point component of proof,
  - eval_a: U256 -> eval_a value component of proof,
  - eval_b: U256 -> eval_b value component of proof,
  - eval_c: U256 -> eval_c value component of proof,
  - eval_s1: U256 -> eval_s1 value component of proof,
  - eval_s2: U256 -> eval_s2 value component of proof,
  - eval_zw: U256 -> eval_zw value component of proof,
  - eval_r: U256 -> eval_r value component of proof,
  - wxi: G1Point -> Wxi point component of proof,
  - wxi_w: G1Point -> Wxiw point component of proof,

Panics if proof is invalid
Panics if nullifier has already been withdrawn
Panics if roots used are too old or invalid
Panics if fee > withdraw value

Sends tokens to recipient and registers nullifier_hash as already used, so that it cannot be double spent.

### View methods
1. `view_account_hash` (Will be deprecated in favor of off chain computation) -> `U256`
params:
  - account_id: AccountId -> account whose MiMC hash value you want to calculate

Calculates MiMC hash of an account id. Necessary to build proofs

2. `view_nullifier_hash` (Will be deprecated in favor of off chain computation) -> `U256`
params:
  - nullifier: U256 -> nullifier used to build commitment

Calculates MiMC hash of nullifier. Necessary to build proofs and commitments

3. `view_commitments_root` -> `U256`

returns last know commitment merkle tree root in the cotnract. Necessary to build proofs

4. `view_allowlist_root` -> `U256`

returns last know allowlist merkle tree root in the cotnract. Necessary to build proofs

5. `view_is_in_allowlist` -> `bool`
params:
  - account_id: AccountId -> account you want to checks

true if account is in whitelist, false otherwise

6. `view_was_nullifier_spent` -> `bool`
params:
  - nullifier: U256 -> nullifier you want to check

true if nullifier was already spent, false otherwise

7. `view_kill_switch` -> `bool`

Returns current value of kill_switch variable

8. `view_is_withdraw_valid` -> `bool`
params:
  - root: U256 -> root value of commitment merkle tree used to build proof
  - nullifier_hash: U256 -> value of nullifier hash used to build proof
  - recipient: AccountId -> account that will receive withdrawn tokens
  - relayer: Option<AccountId> -> account of the relayer of the transaction - if used
  - fee: U256 -> quantity of tokens that will be sent to relayer as a fee
  - refund: U256 -> quantity of tokens that will be sent to relayer as refund for gas
  - whitelist_root: U256 -> root value of whitelist merkle tree used to build proof
  - a: G1Point -> A point component of proof,
  - b: G1Point -> B point component of proof,
  - c: G1Point -> C point component of proof,
  - z: G1Point -> Z point component of proof,
  - t_1: G1Point -> T1 point component of proof,
  - t_2: G1Point -> T2 point component of proof,
  - t_3: G1Point -> T3 point component of proof,
  - eval_a: U256 -> eval_a value component of proof,
  - eval_b: U256 -> eval_b value component of proof,
  - eval_c: U256 -> eval_c value component of proof,
  - eval_s1: U256 -> eval_s1 value component of proof,
  - eval_s2: U256 -> eval_s2 value component of proof,
  - eval_zw: U256 -> eval_zw value component of proof,
  - eval_r: U256 -> eval_r value component of proof,
  - wxi: G1Point -> Wxi point component of proof,
  - wxi_w: G1Point -> Wxiw point component of proof,

Panics if proof and public params submitted are invalid, returns `true` otherwise. Performs the exact same evaluation as `withdraw` method.

### Owner methods
1. `toggle_kill_switch`

Can only be called by owner upon depositing 1 yoctoNEAR.
Toggles value of kill_switch. Default is false. When true, disallows all deposits.