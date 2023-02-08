
# NEP-141 Standard token contract for NEAR protocol

This smart contract creates a token on the NEAR blockchain. This token follows
the [NEP-141 and NEP-148 standards](https://nomicon.io/Standards/Tokens/FungibleToken/).


## Authors

- [@hack-a-chain-software](https://github.com/hack-a-chain-software)


## Appendix

In order to deploy and create a token, there are a few prerequisites necessary:
- Install near CLI (Command Line Interface) - (Please ensure you [have NodeJS](https://nodejs.org/en/download/package-manager/) > 12.)
- Install RUST
- Add Wasm toolchain

### NEAR CLI
To Install the near CLI, open your terminal:
 - On Mac open Terminal using Spotlight with these steps: Press Command + Space Bar on your Mac Keyboard. Type in “Terminal” When you see Terminal in the Spotlight search list, click it to open the app
 - On Windows, click Start and search for "Command Prompt." Alternatively, you can also access the command prompt by pressing Ctrl + r on your keyboard, type "cmd" and then click OK.

and run the following command: 
```bash
  npm install -g near-cli
```
Now, you can run:

```bash
near
```

After that, you can log in on the NEAR account that you would like to be 
the **address where the contract will be deployed** - Please note that this 
is **not the owner of the contract**. To log in, type: 
```bash
near login
```

This will bring you to NEAR Wallet again where you can confirm the creation of a full-access key.

### RUST

Rust is the programming language used to program the smart contract. In order to 
use this contract, you must have rust installed on your computer.

To install Rust we will be using ```rustup``` an installer for rust.
Please see the directions from the [Rustup](https://rustup.rs/#) site. For OS X or Unix, you may use (type on command line):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Pro tip: to keep your command line clean, type ```clear``` and hit enter.

### Wasm toolchain

Smart contracts compile to WebAssembly (Wasm) so we'll add the toolchain for Rust:

```bash
rustup target add wasm32-unknown-unknown
```

More info about it can be found [here](https://rustwasm.github.io/docs/book/).

If you followed correctly the steps above, you are now ready to go. 
You can read more about the NEAR CLI and the deployment of rust codes [here](https://www.near-sdk.io/zero-to-hero/basics/set-up-skeleton)

If the contract is not compiled (it should be), you can compile it using: 

```bash
RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
```

## Deployment

Assuming that you already have the ```NEAR CLI```, ```Rust``` and the ```Wasm Toolchain``` installed, and is logged in 
into the account that you want to deploy the project, we can now 
deploy it.

Now, we are going to deploy this project to the nar blockchain mainnet. 

Frist, make sure you are on the project folder. You can change yout folder by typing:

```bash
cd your-project-folder-path
```

Now, check if your project folders have a folder called ``` out ``` 
and a file called ``` main.wasm ``` if not, [check near-sdk git](https://github.com/near/near-sdk-rs) 
on how to compile the code.


To make it easier to deploy the project, lets create an enviroment variable
with the **address that we want for our contract** (you must be logged into this wallet)

```bash
  export CONTRACT_ID="YOUR_ACCOUNT_NAME.near"
```

Now, finally, we are going to run the following command to deploy the code:

```bash
near deploy --wasmFile out/main.wasm --accountId $CONTRACT_ID
```

At this point, the contract should have been deployed to your account and you're ready to move onto configuring the 
token specifications and setting the contract owner.

### CONFIGURING THE CONTRACT 

Now, are contract is deployed. The next step is to configure it, according to your tokenomics.

If we check the code, will see that we have the following parameters used to define a token:

```bash
        owner_id: AccountId,
        metadata: FungibleTokenMetadata,
```

The ```owner_id ``` is the account that will own the contract. This account will be able perform 
actions that are restricted 

Since this contract has a minting function, the owner will not get any tokens on the contract start. 

At last, the ``` FungibleTokenMetadata ``` ([reference](https://nomicon.io/Standards/Tokens/FungibleToken/Metadata)) is all the token metadata, wich means its all the extra token information
, that describes it. 

This metadata has the following format:

```bash
pub struct FungibleTokenMetadata {
    pub spec: String,
    pub name: String,
    pub symbol: String,
    pub icon: Option<String>,
    pub reference: Option<String>,
    pub reference_hash: Option<Base64VecU8>,
    pub decimals: u8,

```

An implementing contract **MUST** include the following fields on-chain:

- ```spec```: a string. Should be ```ft-1.0.0``` to indicate that a Fungible Token contract adheres to the current versions of this Metadata and the Fungible Token Core specs. This will allow consumers of the Fungible Token to know if they support the features of a given contract
- ```name```: the human-readable name of the token, E.g.: Bitcoin
- ```symbol```: the abbreviation, E.g.: BTC
- ```decimals```: used in frontends to show the proper significant digits of a token. This concept is explained well in this [OpenZeppelin](https://docs.openzeppelin.com/contracts/3.x/erc20#a-note-on-decimals) post - NEAR NEP-141 standard is to have 24 decimals.

An implementing contract **MAY** include the following fields on-chain

- ```icon```: a small image associated with this token. Must be a data URL, to help consumers display it quickly while protecting <br> user data [more information](https://nomicon.io/Standards/Tokens/FungibleToken/Metadata).
- ```reference```: a link to a valid JSON file containing various keys offering supplementary details on the token. <br>Example: /ipfs/QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm, https://example.com/token.json, etc. If the information given in this document conflicts with the on-chain attributes, the values in reference shall be considered the source of truth.
- ```reference_hash```:the base64-encoded sha256 hash of the JSON file contained in the reference field. This is to guard against off-chain tampering.

Although it is note necessary, we **strongly recommend** that you that you implement the fields mentioned above.

Also, we recommend that your logo is an SVG.

Now that we have everything covered, we can call the ```new``` function and set our token parameters. Below is the command that we are going to use to set the token parameters. 

Note that the ```owner_id``` is the owner account for that contract, and that cannot be changed. The owner of the contract is going to receive all of the tokens once you call the function. You are going to be able to check your NEAR Wallet and the tokens should be there.

Copy the code below, change all of the paramters and run the command on your terminal.

```bash
    near call $FT_CONTRACT_ID new '{
      "owner_id": "owner.near",
      "metadata": {
         "spec": "ft-1.0.0",
         "name": "Bitcoin",
         "symbol": "BTC",
         "icon": "data:image/svg+xml,%3C…",
         "reference": "https://example.com/wbtc.json",
         "reference_hash": "AK3YRHqKhCJNmKfV6SrutnlWW/icN5J8NUPtKsNXR1M=",
         "decimals": 24
      }
    }' --accountId owner.near

```

**If you do not want to set an icon, a reference and a reference hash, you must pass this parameters with the value ```null```** E.g.:

```bash
  "icon": null,
```

With these steps concluded, you'll have sucessfully deployed and configured your token contract. 

## REGISTER AN USER

In order to register a user on the contract, you must use the function ```storage_deposit```. Here's how to use this function:

```bash
near call $FT_CONTRACT_ID storage_deposit '{"account_id": "any_account.near"}' \
  --accountId owner_account.near --amount 0.00235
```

The ```amount``` is the initial deposit to register the user. The ```account_id``` is the user account you want to register. For further information you can
check [this link](https://nomicon.io/Standards/StorageManagement).

That's all the information you need to use the contract.

For further reference on other functions that the contract has, you can always check the [Contract Standards](https://nomicon.io/Standards/Tokens/FungibleToken/Core).
