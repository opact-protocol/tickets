# Hideyour.cash Instance Smart Contract

Instance Smart contract is responsible for receiving deposits and issuing withdrawals. Each instance can only receive deposits of a single token type at a fixed amount.

The contract references the registry in its initialization and trusts the registry for all allowlist related data.

## Protocol fees
The contract implements a protocol fee, which is a percentage taken from every deposit and transferred to the owner account.

This fee is variable and is set during contract initialization. To protect users from fee changes that would affect their deposits, once the fee is set it can never be reset.

## Contract ownership
The contract implements an ownership model, where a priviledged `owner` account has access to methods that regular users do not.

However, since the intent of the contract is to be totally decentralized, `owner` does not have access to any funds stored in the contract, cannot alter any preset parameters and if `owner` is ever compromised, it represents no risk for the contract whatsoever.

The only method that owner has access to is `toggle_kill_switch`. This method toggles the value of `kill_switch` which is used to lock new deposits to the protocol. This has 2 main use cases:
1. Upgrading the contract -> new deposits will be forbidden and users will only be able to withdraw. A new contract will be deployed with updated version.
2. AML failures -> in case the AML system is currepted somehow either by corruption of third party data providors or by attacks on HYC's security model, the owner can stop the contract to prevent further damage while the team works in improving the protocol to upgrade to a new version.

The account that deploys the HYC  contract should burn all it access keys to ensure users that the protocol is fully decentralized and - given a secure source code - their funds cannot be tampered with.

## API

### Anonimity methods

1. `deposit`
params:
  - secrets_hash: U256 -> hash value of (secret | nullifier) according to circuit docs. Must be formatted as decimal number in string format

User calling this method must attach the NEAR amount corresponding to the contract's value. This only works if contract has been initialized using NEAR as its currency. Deposit value must be exactly the initialized value.

Panics if contract kill_switch is activated
Panics if user is not in allowlist
Inserts the commitment in the contract so that a withdraw can be made using the secrets

2. `ft_on_transfer`
params:
  - sender_id: AccountId -> Account that originally sent funds
  - amount: U128 -> Quantity of tokens sent. Must be exactly the value used when initializing the contract
  - msg: String -> hash value of secret | nullifier according to circuit docs. Must be formatted as decimal number in string format

This method will be called when using `ft_transfer_call` on the NEP-141 contract. For more information on `ft_transfer_call` mechanims (read the docs)[https://nomicon.io/Standards/Tokens/FungibleToken/Core#nep-141].

This method can only be called from the NEP-141 contract address passed when initializing the HYC contract. If you try to transfer any other token the call will panic.

Panics if contract kill_switch is activated
Panics if user is not in allowlist
Inserts the commitment in the contract so that a withdraw can be made using the secrets

3. `withdraw`
params:
  - root: U256 -> root value of commitment merkle tree used to build proof
  - nullifier_hash: U256 -> value of nullifier hash used to build proof
  - recipient: AccountId -> account that will receive withdrawn tokens
  - relayer: Option<AccountId> -> account of the relayer of the transaction - if used
  - fee: U256 -> quantity of tokens that will be sent to relayer as a fee
  - refund: U256 -> quantity of tokens that will be sent to relayer as refund for gas
  - allowlist_root: U256 -> root value of allowlist merkle tree used to build proof
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

4. `view_was_nullifier_spent` -> `bool`
params:
  - nullifier: U256 -> nullifier you want to check

true if nullifier was already spent, false otherwise

5. `view_kill_switch` -> `bool`

Returns current value of kill_switch variable

6. `view_contract_params` -> `ContractParams`

Returns object containing all setup parameters in place for the contract

7. `view_is_withdraw_valid` -> `bool`
params:
  - root: U256 -> root value of commitment merkle tree used to build proof
  - nullifier_hash: U256 -> value of nullifier hash used to build proof
  - recipient: AccountId -> account that will receive withdrawn tokens
  - relayer: Option<AccountId> -> account of the relayer of the transaction - if used
  - fee: U256 -> quantity of tokens that will be sent to relayer as a fee
  - refund: U256 -> quantity of tokens that will be sent to relayer as refund for gas
  - allowlist_root: U256 -> root value of allowlist merkle tree used to build proof
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

** This evaluation does not include a validation of the allowlist_root value. This must be validated within the registry contract using `view_is_allowlist_root_valid`.

### Owner methods
1. `toggle_kill_switch`

Can only be called by owner upon depositing 1 yoctoNEAR.
Toggles value of kill_switch. Default is false. When true, disallows all deposits.
