# Hideyour.cash Smart Contracts

This suite of smart contracts implements a zk transaction mixer on NEAR protocol that is nativelly integrated into [hapi.one's anti money laundering software](https://hapi.one/).

The contract support both NEAR native token and NEP-141 tokens.

## Mixing logic

The contract provides anonimicity to users by leveraging a transaction mixer. Users can deposit funds with the deposit method and withdraw them from another account with the withdraw method by prociding a zk Proof of deposit.

The mechanism is based on tornado.cash's zk scheme with a twist that allows it to perform anti money laundery compliance.

## Anti money laundery

The anti money laundery scheme is powered by [hapi.one](https://hapi.one/).

Upon setting up the contract a max tolerated risk level is selected by the deployer for each different risk category. Accounts can only interact with the protocol if they present a risk level smaller than the max tolerated level.

To interact with the protocol for the first time, an account must be added to the allowlist. To require inclusion in the allowlist, a user must call `allowlist` and pass in their account id - the address will then be queried by hapi.one and, if it present a risk level below or equal to the threshold, the user will be included in the allowlist.

Once a user has been added to the allowlist, they may deposit funds into the protocol and other users may withdraw them. However, it is always possible for anyone (this will be done by robots in production and rewarded) to challange addresses that are in the allowlist, by performing new queries to hapi.one.
This is done through the `denylist` method. It will query the account passed into hapi.one and, should the risk be greater than the threshold the account will be added to the denylist and will not be able to deposit new funds nor withdraw previously deposited funds.

## Protocol fees
The contract implements a protocol fee, which is a percentage taken from every deposit and transferred to the owner account.

This fee is variable and is set during initialization of each instance contract. To protect users from fee changes that would affect their deposits, once the fee is set it can never be reset.

## NEP-141 storage
According to NEP-141 documentation, tokens should implement storage registration for anyone that wants to hold a token balance.

This has implications for this contract when using a NEP-141 token.

Whenever a user tries to withdraw to an account that is not registered in the contract for the token, the transaction is going to be reverted so that the user does not lose their funds.
Relayers and front end apps should check registration and pay for storage in case the accounts are not registered.

However, if owner or relayer are not registered in the NEP-141 contract, the fees that are transferred to them on each withdraw are going to fail and the funds will be locked in the HYC contract forever. So make sure that owner and relayers are registered in the contract. 

## Contract ownership
The contract implements an ownership model, where a priviledged `owner` account has access to methods that regular users do not.

However, since the intent of the contract is to be totally decentralized, `owner` does not have access to any funds stored in the contract, cannot alter any preset parameters and if `owner` is ever compromised, it represents no risk for the contract whatsoever.

The only method that owner has access to is `toggle_kill_switch`. This method toggles the value of `kill_switch` which is used to lock new deposits to the protocol. This has 2 main use cases:
1. Upgrading the contract -> new deposits will be forbidden and users will only be able to withdraw. A new contract will be deployed with updated version.
2. AML failures -> in case the AML system is currepted somehow either by corruption of third party data providors or by attacks on HYC's security model, the owner can stop the contract to prevent further damage while the team works in improving the protocol to upgrade to a new version.

The account that deploys the HYC  contract should burn all it access keys to ensure users that the protocol is fully decentralized and - given a secure source code - their funds cannot be tampered with.

## Architecture

The system is designed around a single REGISTRY smart contract and multiple INSTANCE smart contracts.

The registry is responsible for the setup of all AML parameters and for keeeping track of all different currencies and amounts supported by the protocol.

Instace smart contracts are where funds are actually mixed. Each instance only accepts one token type and deposits and withdraws can only be made in a fixed amount. That ensures external observers cannot differentiate between withdraws, guaranteeing more anonymity to users.