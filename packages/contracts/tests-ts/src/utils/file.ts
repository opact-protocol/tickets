import fs from "fs";

export const readInputs = (relayer: any, sdkAccount: any, owner: any) => {
  return {
    commitment1: JSON.parse(fs.readFileSync("./commitment1.json") as any),
    commitment2: JSON.parse(fs.readFileSync("./commitment2.json") as any),
    commitment3: JSON.parse(fs.readFileSync("./commitment3.json") as any),
    commitment4: JSON.parse(fs.readFileSync("./commitment4.json") as any),
    proof1: JSON.parse(fs.readFileSync("./proof1.json") as any),
    proof2: JSON.parse(fs.readFileSync("./proof2.json") as any),
    public1: JSON.parse(fs.readFileSync("./public1.json") as any),
    public2: JSON.parse(fs.readFileSync("./public2.json") as any),
    relayer: JSON.parse(
      fs.readFileSync(
        `.near-credentials/testnet/${relayer.accountId}.json`
      ) as any
    ),
    sdk: JSON.parse(
      fs.readFileSync(
        `.near-credentials/testnet/${sdkAccount.accountId}.json`
      ) as any
    ),
    owner: JSON.parse(
      fs.readFileSync(
        `.near-credentials/testnet/${owner.accountId}.json`
      ) as any
    ),
  };
};
