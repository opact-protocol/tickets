const nearAPI = require("near-api-js");
const { BN, KeyPair } = require("near-workspaces");
const fs = require("fs");
const crypto = require("crypto");

const {
  connect,
  keyStores,
  accountCreator: { UrlAccountCreator },
  providers,
} = nearAPI;

module.exports = { deployRegistry };

async function deployRegistry(accountCreator, contractArray) {
  let last_block = await near.connection.provider.block({ finality: "final" });
  let last_block_height = last_block.header.height;

  // save all base accounts to be created
  const random_prefix = crypto.randomBytes(10).toString("hex");
  const contractAccount = await createAccount(
    accountCreator,
    config,
    near,
    random_prefix + "hycregistry.testnet"
  );

  // deploy and initialize contract
  const contractWasm = fs.readFileSync("../out/registry.wasm");
  await contractAccount.deployContract(contractWasm);

  await contractAccount.functionCall({
    contractId: contractAccount.accountId,
    methodName: "new",
    args: {
      owner: contractAccount.accountId,
    },
    gas: "300000000000000",
  });

  // add contracts to registry
  for (let contract of contractArray) {
    const { currency, amount, account_id } = contract;
    await contractAccount.functionCall({
      contractId: contractAccount.accountId,
      methodName: "add_entry",
      args: {
        currency,
        amount,
        account_id,
      },
      gas: "300000000000000",
      attachedDeposit: "1",
    });
  }
}
