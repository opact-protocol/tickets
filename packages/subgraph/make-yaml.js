const writeYamlFile = require("write-yaml-file");
require("dotenv").config();

const { HYC_CONTRACT_PREFIX, HYC_START_BLOCK } = process.env;

if (!HYC_CONTRACT_PREFIX || !HYC_START_BLOCK) {
  throw new Error("Env is required to make subgraph yaml file");
}

writeYamlFile("subgraph.yaml", {
  specVersion: "0.0.5",
  schema: {
    file: "./schema.graphql",
  },
  dataSources: [
    {
      kind: "near",
      name: "hyc",
      network: "near-testnet",
      source: {
        accounts: {
          prefixes: [HYC_CONTRACT_PREFIX],
        },
        startBlock: Number(HYC_START_BLOCK),
      },
      mapping: {
        apiVersion: "0.0.6",
        language: "wasm/assemblyscript",
        entities: [
          "DepositMerkleTreeUpdate",
          "AllowlistMerkleTreeUpdate",
          "Withdrawal",
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
