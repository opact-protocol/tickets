import { NearConfiguration } from "src/near/configuration";
import { MoneyConfiguration } from "src/money/configuration";

export interface Configuration {
  near: NearConfiguration;
  money: MoneyConfiguration;
}

export function configuration(): Configuration {
  return {
    near: {
      connection: {
        networkId: process.env.NEAR_NETWORK,
        nodeUrl: process.env.NEAR_NODE_URL,
      },

      account: {
        id: process.env.ACCOUNT_ID,
        keyPair: process.env.ACCOUNT_KEYPAR,
      },
    },

    money: {
      contractId: process.env.CONTRACT_ID,
    },
  };
}
