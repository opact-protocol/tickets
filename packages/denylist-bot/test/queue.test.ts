import testnetSetup from "./test_setup.json";
import { consumer } from "../src/services/consumer";
import { describe, expect, jest, it, beforeAll } from '@jest/globals';
import { setupNear, viewFunction } from "../src//utils/near";

const payload = {
  counter: '34',
  account: '3ae95aeeb5a4600264ecneko.testnet',
  category: 'Theft',
  risk: '7',
};

const baseEnv = {
  NEAR_NETWORK: "testnet",
  HYC_CONTRACT: testnetSetup.hyc_contract,
  RPC_URL: "https://rpc.testnet.near.org",
  ACCOUNT_ID: testnetSetup.account.account_id,
  PRIVATE_KEY: testnetSetup.account.private_key,
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
    const inAllowlist = await viewFunction(
      baseEnv.RPC_URL,
      baseEnv.HYC_CONTRACT,
      'view_is_in_allowlist',
      {
        account_id: payload.account,
      },
    );

    expect(inAllowlist).toEqual(false);

    account.functionCall({
      contractId: baseEnv.HYC_CONTRACT,
      methodName: "allowlist",
      args: {
        account_id: payload.account,
      },
      gas: "300000000000000" as any,
      attachedDeposit: "480000000000000000000" as any,
    });

    expect(inAllowlist).toEqual(true);

    try {
      await consumer(payload, baseEnv as any);
    } catch (e) {
      console.warn(e);
    }

    const inDenylist = await viewFunction(
      baseEnv.RPC_URL,
      baseEnv.HYC_CONTRACT,
      'view_is_in_allowlist',
      {
        account_id: payload.account,
      },
    );

    expect(inDenylist).toEqual(true);
  });
});
