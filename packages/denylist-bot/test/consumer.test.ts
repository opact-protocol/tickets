import testnetSetup from "../test_setup.json";
import { consumer } from "../src/services/consumer";
import { allowlistDeposit, attachedGas, setupNear, viewFunction } from "../src/utils";
import { describe, expect, jest, it, beforeAll } from '@jest/globals';

const payload = {
  counter: '34',
  account: '19b5ee6a1586bc18144e0718d93e1cb05b8c752e15b73ee4200d5ee4e88ac3b1',
  category: 'Theft',
  risk: '7',
};

const baseEnv = {
  NEAR_NETWORK: "testnet",
  HYC_CONTRACT: testnetSetup.hyc_contract,
  RPC_URL: "https://rpc.testnet.near.org",
  ACCOUNT_ID: testnetSetup.owner.account_id,
  PRIVATE_KEY: testnetSetup.owner.private_key,
};

describe("Test all service actions", () => {
  jest.setTimeout(1000000000);

  let account: any = null;
  let connection: any = null;

  beforeAll(async () => {
    connection = await setupNear({
      RPC_URL: "https://archival-rpc.testnet.near.org",
      ACCOUNT_ID: baseEnv.ACCOUNT_ID,
      PRIVATE_KEY: baseEnv.PRIVATE_KEY,
      NEAR_NETWORK: "testnet",
    } as any);

    account = await connection.account(baseEnv.ACCOUNT_ID);
  });

  it("should return success - The account has been banned", async () => {
    let inAllowlist = await viewFunction(
      baseEnv.RPC_URL,
      baseEnv.HYC_CONTRACT,
      'view_is_in_allowlist',
      {
        account_id: payload.account,
      },
    );

    expect(inAllowlist).toEqual(false);

    await account.functionCall({
      contractId: baseEnv.HYC_CONTRACT,
      methodName: "allowlist",
      args: {
        account_id: payload.account,
      },
      gas: attachedGas,
      attachedDeposit: allowlistDeposit,
    });

    try {
      await account.functionCall({
        contractId: testnetSetup.hapi_contract,
        methodName: "create_address",
        args: {
          address: payload.account,
          category: "Theft",
          risk: 10,
        },
        gas: attachedGas,
      });

      await consumer(payload, baseEnv as any);
    } catch (e) {
      console.warn(e);
    }

    try {
      await account.functionCall({
        contractId: baseEnv.HYC_CONTRACT,
        methodName: "allowlist",
        args: {
          account_id: payload.account,
        },
        gas: attachedGas,
        attachedDeposit: allowlistDeposit,
      });
    } catch (e: any) {
      console.log(e.message);
      expect(e.message).toContain("Account risk is too high");
    }
  });
});
