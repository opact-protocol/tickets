# Hideyour.cash Registry Smart Contract

The smart contract implements a NEAR protocol compatible Registry to allow multiple different amounts and currencies to be used with hideyour.cash.

The goal is for end users to be able to:
1. Discover all token and amount options available in HYC;
2. Discover the correct addresses for every available currency and amount option within HYC;

The ideal logic would be for this to be the single point of contact for every interaction with HYC. However, given NEAR protocol's asynchronous nature, it is not possible to implement a router or proxy as we would for a different blockchain, such as Ethereum.

## Contract logic
The contract stores an UnorderedSet containing all different currencies accepted in the protocol. It also contains an UnorderedMap mapping each tuple (Currency, Amount) to its corresponding contract address.

Only the owner can insert new currencies and amounts

## Contract interface

### Initialize
1. `new`
params:
currency: Currency, amount: U256, contract: AccountId
  - owner: AccountId -> account that will be able to edit the registry

Method to initialize the contract with a specified owner. The owner is going to be the only account able to alter the registry. Current implementation does not allow future changes in owner.

### Change methods (owner restricted)
1. `add_entry`
params:
currency: Currency, amount: U256, contract: AccountId
  - currency: Currency -> The currency of the contract address you want to add
  - amount: U256 -> Amount value of deposits for HYC contract you want to add
  - contract: AccountId -> Address of the HYC contract that you're adding to the registry

This method can only be called by the contract owner.
It adds a specific entry to the registry (adds a contract address for the (currency, amount) pair).
If there was a previous contract stored in the location it will be overwritten.

2. `remove_entry`
params:
  - currency: Currency -> The currency of the contract address you want to remove
  - amount: U256 -> Amount value of deposits for HYC contract you want to remove

This method removes one entry from the registry, according to the (currnecy, amount) pair specified in args.
Panics if currency or amount is not registered.

### View methods
1. `view_all_currencies` -> `Vec<Currency>`

Returns a Vec with all supported currencies in HYC.

2. `view_currency_contracts` -> `HashMap<U256, AccountId>`
params:
  - currency: Currency -> Currency for which you want to query all available contracts

Returns a HashMap mapping each available deposit amount in the currency to the corresponding HYC contract address 