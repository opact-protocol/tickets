# Hideyour.cash

Hideyour.cash is a compliant anonymous transactions tool, that utilizes ZK (Zero-knowledge proof) technology.

This application allow any user to deposit near to the contract by submiting a secret key. With this key, the user can later withdrawl the deposited value to any give account by using a Zero Knowledge Proof.

This insures privacy, since it is not possible to link the depositer and the withdrawer.

The contract also supports mechanisms to hinder malicious users from using the proctocol. This is done by using a whitelist and blacklist feature. 

The whitelist is a list of verified users - this verification is done using third part KYC services (in progress).

The blacklist feature allows for the community to add malicious users to it, and prevents them from interacting with the protocol. In case these accounts had already deposited funds to the contract, no one would be able to withdraw them anymore (unless the user is removed from the blacklist).

## Features

- Use a certified partner to register yourself to the whitelist to use the project (currently a mockup)
- Generate a key and make a deposit (fully functional)
- Withdrawl the transaction to a given address, without revealing who made the deposi (fully funtional)
- Blacklist malicious users (feature availble but has to be improved)


## Tech

### Installation

Hideyour.cash requires [Node.js], [yarn], [rust] and the [wasm toolchain]. It is recommended that you follow [near skd tutorial] to install rust and wasm.

After installing all the tools, you can run the command:

```sh
yarn 
```
And install all the dependencies

### Smart Contracts

**Build**

To build the contracts run
```
yarn contracts build:contract
```

**Core contract functionality**

Assuming that you already have the NEAR CLI, Rust and the Wasm Toolchain installed, and is logged in into the account that you want to deploy the project, we can now deploy it.

```sh
near deploy --wasmFile out/contract.wasm --accountId hideyourcash.testnet
```
CONFIGURING THE CONTRACT
Now, are contract is deployed. The next step is to initialize it.

If we check the code, will see that we have the following parameters used on the initialize function :
```sh
pub struct Contract {
  pub owner: AccountId,
  // blacklist responsible accounts
  pub guardian: LookupSet<AccountId>,
  //white list responsible smart contract (mock up with just account at the moment)
  pub authorizer: LookupSet<AccountId>,
  pub commitments: MerkleTree,

  pub whitelist: WhitelistMerkleTree,
  pub deposit_value: u128,
  pub verifier: Verifier,
  pub nullifier: LookupSet<U256>,
}
````
Note that `commitments` is a MerkleTree, the same as `whitelist` - these are not native to NEAR SDK. The `verifier` and `nullifier` are also a structures that are not native to NEAR. These structures are necessary for the ZK - these structures will be detailed later. It is also possible to refer to the libs that we created, that detail them. 

To initialize the contract, we use the following command:

```sh
near call hideyourcash.testnet new '{ "owner": "hycadmin.testnet", "height": 20, "last_roots_len": 20, "field_size": "21888242871839275222246405745257275088548364400416034343698204186575808495617", "zero_value": "21663839004416932945382355908790599225266501822907911457504978515578255421292", "height_wl": 20, "last_roots_len_wl": 20, "zero_value_wl": "21663839004416932945382355908790599225266501822907911457504978515578255421292", "deposit_value": "10", "verifier": { "alfa1": { "x": "11929434009103390266755415091858623822884685127957621260775374579078909737674", "y": "11068084853340904043186348227688297612169140696215318326919782966060881527637" }, "beta2": { "x": [ "12329300379284736487759277870289591812325857359120129210116695958510025528558", "405103167280479565761562144537635617063562368060534814239209215321256266140" ], "y": [ "11190969014479503631176203693358577894804923600122382113070408317153327961174", "12169250944775138496715645948096141163163222170597888800716258068649996251897" ] }, "gamma2": { "x": [ "10857046999023057135944570762232829481370756359578518086990519993285655852781", "11559732032986387107991004021392285783925812861821192530917403151452391805634" ], "y": [ "8495653923123431417604973247489272438418190587263600148770280649306958101930", "4082367875863433681332203403145435568316851327593401208105741076214120093531" ] }, "delta2": { "x": [ "5790202932707851834971338329931905576169490530124069101001782500222600854667", "14948968581672768531234399884275269144859974027397561018343232479343421127230" ], "y": [ "10336507888871439774654247008473901721063319537508224631564880035016520689734", "9856599487216717989610058910919798666517375961900162444491443343101268985449" ] }, "ic": [ { "x": "10558925288976907965469300478434171166775183168644571041226339931044639838584", "y": "2561981498437337100558731678149702647801128505609318505259938216989529526583" }, { "x": "8692640465836940407247076561528588802257111263627111557005104421314190010881", "y": "1492817016321743921111533287773482629323490494560752468008119668502178842957" }, { "x": "9015295882064685058646324579770369169624639664495134765302964899445979537974", "y": "9220238172256923283206443173669350824409336506344747783997179667821109845937" }, { "x": "2680708481975690632841888313988626621815593840420314570935868033529951064689", "y": "2428212461168282306651389254055425154125555233810089742483138937711829274770" }, { "x": "21646405787355360791256498679491825515973450327612830612936932142232629913707", "y": "15404896862389849666318248755422192986896025439607580119236344479246185994127" }, { "x": "7326800130457667302128074678103962581759337277766929222842481653542128159923", "y": "17556940140161222241436428793839198285369063812134558716647967460395775065825" }, { "x": "19217544629750115119592690785243318580209244929795854424339912058683641377341", "y": "5275743184122146803743646574109679197034814281423391774005054020728907444825" }, { "x": "626944075200141454123327199571007123899735939592938593344851156659404091574", "y": "15292655118984704290635080824856783361562663820634332747656851161472762170700" } ], "snark_scalar_field": "21888242871839275222246405745257275088548364400416034343698204186575808495617" } }' --accountId hideyour.testnet --gas 300000000000000
```

It is a massive command due to the `whitelist`, `commitments` and `verifier` - we strongly recommend that you use the same command. If you want to change the standard value of deposit, you can change the `value_of_deposit` variable.

UTILIZING THE CONTRACT

Once the contract is built, deployed and initialized, we now must add `authorizers`, to that contract, in order to validade the users - note that this function is currently a mockup of a more complex feature. 

To add a verifier, we do the following:
```sh
near call hideyourcash.testnet new_authorizer '{"authorizer": "authorizer.testnet"}' --accountId hycadmin.testnet
```
*Note: this function is restricted to the owner of the contract.*

The verifier interacts with the contact, adding users to the whitelist - you can implement any logic at the moment for the verifier. If you want to add users manually through the cli, you can use the `whitelist` command:

```sh
near call hideyourcash.testnet whitelist '{"account_id": "whitelisted_user.testnet"}' --accountId hycadmin.testnet
```

Now, the user that was added is able to interact with the contract and make a deposit directly using the front-end.

To run the front end locally, you can perform:

```sh
yarn front dev
```

   [near sdk tutorial]: <https://docs.near.org/sdk/rust/introduction>
   [rust]: <https://rustup.rs/>
   [Node.js]: <https://nodejs.org/en/>
   [yarn]: <https://yarnpkg.com/>
   
   
   
