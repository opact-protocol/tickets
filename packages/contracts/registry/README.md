# Hideyour.cash Registry Smart Contract

The smart contract implements a NEAR protocol compatible Registry to allow multiple different amounts and currencies to be used with hideyour.cash.

The goal is for end users to be able to:
1. Discover all token and amount options available in HYC;
2. Discover the correct addresses for every available currency and amount option within HYC;
3. Allow the seamless replacement of deprecated contracts for their updated versions without compromising users ability to withdraw deposited funds;
4. Allow relayers to check whether specific contracts should be trusted; 

The ideal logic would be for this to be the single point of contact for every interaction with HYC. However, given NEAR protocol's asynchronous nature, it is not possible to implement a router or proxy as we would for a different blockchain, such as Ethereum.

## Contract logic
The contract stores an `UnorderedMap` mapping each currency to a `HashMap` of deposit amounts accepted and the contract address for that amount.
The contract also stores an `UnorderedSet` containing all HYC contracts ever deployed, to allow relayers and users to validate the addresses of deprecated contracts in case there are still funds to withdraw on them.

Only the owner can insert new currencies and amounts.
Every time a contract is added to the registry it is added both to the map and the allowlist set. If the contract is removed from the map - be it because HYC frontend doesn't want to support it anymore or because it has been deprecated in an upgrade - it is still going to be available in the allowlist, to allow users to withdraw funds they had previously deposited to them.
In case a contract ever needs to be removed from the allowlist, this operation should be explicitly done after removing from the map, using `remove_from_allowlist`.

## Security assumptions
This contract does not handle user funds directly, it is only an on-chain information registry. Therefore, this contract has no intention of being run as a fully decentralized application. It is going to be controlled by the development team during project's early phases and handled over to the DAO structure later on.

If a hacker ever compromises this contract, the main consequence would be the possibility to insert malicious contract into the registry, which would be trusted by frontends and relayers running the protocol - and by its end users in extension. This could carry great consequences, allowing phishing scams to effectivelly attack users. However, there would be no risk for already deposited funds.

To keep maximum security, owner's private keys should be stored in a hardware wallet and later on transferred to a DAO structure.

## Contract interface

### Initialize
1. `new`
params:
  - owner: AccountId -> account that will be able to edit the registry
  - authorizer: AccountId -> Account of hapi.one protocol contract
  - risk_params: Vec<CategoryRisk> -> Risk parameters for contract allowlist
  - height: u64 -> height of allowlist merkle tree
  - last_roots_len: u8 -> quantity of previous allowlist roots to be stored in contract
  - q: U256 -> Field size for ZK calculations
  - zero_value: U256 -> Zero value for ZK calculations

Method to initialize the contract with a specified owner. The owner is going to be the only account able to alter the registry. Current implementation does not allow future changes in owner.

### Change methods (owner restricted)
1. `add_entry`
params:
  - currency: Currency -> The currency of the contract address you want to add
  - amount: U256 -> Amount value of deposits for HYC contract you want to add
  - account_id: AccountId -> Address of the HYC contract that you're adding to the registry

This method can only be called by the contract owner.
It adds a specific entry to the registry (adds a contract address for the (currency, amount) pair).
If there was a previous contract stored in the location it will be overwritten.

2. `remove_entry`
params:
  - currency: Currency -> The currency of the contract address you want to remove
  - amount: U256 -> Amount value of deposits for HYC contract you want to remove

This method removes one entry from the registry, according to the (currnecy, amount) pair specified in args.
Panics if currency or amount is not registered.

3. `remove_from_allowlist`
params:
  - account_id: AccountId -> Address of the HYC contract that you're removing from the allowlist

This method removes one entry from the allowlist. 

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

### View methods
1. `view_all_currencies` -> `Vec<Currency>`

Returns a Vec with all supported currencies in HYC.

2. `view_currency_contracts` -> `HashMap<U256, AccountId>`
params:
  - currency: Currency -> Currency for which you want to query all available contracts

Returns a HashMap mapping each available deposit amount in the currency to the corresponding HYC contract address 

3. `view_is_contract_allowed` -> `bool`
params:
  - account_id: AccountId -> Address of the contract whose allowlist membership you want to check

Returns `true` if contract is in allowlist, `false` otherwise.

4. `view_contract_allowlist` -> `Vec<AccountId>`

Returns a Vec containing all contract addresses in the allowlist.
There is a know limitation to retrive large lists, however allowlist is not expected to ever exceed 100 elements

5. `view_allowlist_root` -> `U256`

returns last know allowlist merkle tree root in the cotnract. Necessary to build proofs

6. `view_is_in_allowlist` -> `bool`
params:
  - account_id: AccountId -> account you want to checks

true if account is in allowlist, false otherwise