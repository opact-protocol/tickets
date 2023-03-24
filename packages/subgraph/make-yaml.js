const writeYamlFile = require("write-yaml-file");
require("dotenv").config();

const { HYC_CONTRACT_PREFIX, HYC_START_BLOCK, HAPI_CONTRACT_PREFIX, VITE_NEAR_NETWORK } = process.env;

if (!HYC_CONTRACT_PREFIX || !HYC_START_BLOCK || !HAPI_CONTRACT_PREFIX || !VITE_NEAR_NETWORK) {
  throw new Error("Env is required to make subgraph yaml file");
}

const accounts = VITE_NEAR_NETWORK == "mainnet" ? {suffixes: [HYC_CONTRACT_PREFIX, HAPI_CONTRACT_PREFIX]} : {prefixes: [HYC_CONTRACT_PREFIX], suffixes: [HAPI_CONTRACT_PREFIX]};
const network = VITE_NEAR_NETWORK == "mainnet" ? "near-mainnet" : "near-testnet";

writeYamlFile("subgraph.yaml", {
  specVersion: "0.0.5",
  schema: {
    file: "./schema.graphql",
  },
  dataSources: [
    {
      kind: "near",
      name: "hyc",
      network,
      source: {
        accounts,
        startBlock: Number(HYC_START_BLOCK),
      },
      mapping: {
        apiVersion: "0.0.6",
        language: "wasm/assemblyscript",
        entities: [
          "DepositMerkleTreeUpdate",
          "AllowlistMerkleTreeUpdate",
          "Withdrawal",
          "HapioneEntry",
          "HapioneControl",
        ],
        receiptHandlers: [
          {
            handler: "handleReceipt",
          },
        ],
        file: "./assembly/mappings.ts",
      },
    },
  ],
}).then(() => {
  console.log("Finish Yaml");
});
