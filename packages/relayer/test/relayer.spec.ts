import testnetSetup from "./test_setup.json";
import { viewFunction } from "../src/services/near";
import withdrawPayload from "./withdraw_payload.json";
import { relayer, calculateFee } from "../src/services";
import Big from "big.js";

const errorStatus = 500;
const successStatus = 200;

const HEADERS = {
  "Content-Type": "application/json",
};

const baseEnv = {
  RELAYER_FEE: "0.10",
  NEAR_NETWORK: "testnet",
  RELAYER_URL: "foo.com.br",
  BASE_STORAGE_FEE: "0.1",
  HYC_CONTRACT: testnetSetup.hyc_contract,
  RPC_URL: "https://rpc.testnet.near.org",
  ACCOUNT_ID: testnetSetup.account.account_id,
  PRIVATE_KEY: testnetSetup.account.private_key,
};

test("should return error - should specify correct relayer address", async () => {
  const {
    body: { token },
  } = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId: testnetSetup.tokenInstance,
        receiverAccountId: testnetSetup.account.account_id,
      },
    } as any,
    baseEnv as any
  )) as any;

  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
        relayer: "foo.ba",
      },
      token,
    },
  };

  const { body, status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(errorStatus);
  expect(body.error).toContain(
    `should specify correct relayer address: ${baseEnv.ACCOUNT_ID}`
  );
});

test("should return error - should at least minimum relayer fee", async () => {
  const {
    body: { token },
  } = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId: testnetSetup.tokenInstance,
        receiverAccountId: testnetSetup.account.account_id,
      },
    } as any,
    baseEnv as any
  )) as any;

  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
        fee: 0,
        quantity: 10,
      },
      token,
    },
  };

  const { body, status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(errorStatus);
  expect(body.error).toContain("should at least minimum relayer fee");
});

test("should return error - Your withdraw payload is not valid", async () => {
  const {
    body: { token },
  } = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId: testnetSetup.tokenInstance,
        receiverAccountId: testnetSetup.account.account_id,
      },
    } as any,
    baseEnv as any
  )) as any;

  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
        nullifier_hash: "1234",
      },
      token,
    },
  };

  const { body, status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(errorStatus);
  expect(body.error).toContain("Your withdraw payload is not valid");
});

test("should return sucess - withdraw", async () => {
  const {
    body: { token },
  } = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId: testnetSetup.tokenInstance,
        receiverAccountId: testnetSetup.account.account_id,
      },
    } as any,
    baseEnv as any
  )) as any;

  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
      },
      token,
    },
  };

  const { status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(successStatus);
}, 50000);

test("Relayer - Dynamic fee test", async () => {
  const prefix = testnetSetup.hyc_contract.replace(
    "registryhyctest.testnet",
    ""
  );

  const instanceId = `${prefix}tokenhyctest10.testnet`;

  let res = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId,
        receiverAccountId: "mmc-game03.testnet",
      },
    } as any,
    baseEnv as any
  )) as any;

  expect(res.status).toBe(successStatus);

  const { deposit_value } = await viewFunction(
    baseEnv.RPC_URL,
    instanceId,
    "view_contract_params"
  );

  const bigDepositValue = new Big(deposit_value);
  const bigPercentage_fee = new Big(res.body.percentage_fee);

  const proof = bigDepositValue.mul(bigPercentage_fee).toFixed(0);

  expect(res.body.price_token_fee).toBe(proof);

  res = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId,
        receiverAccountId:
          "ed41d2e3421c531b38a7fbe1574a9ad4cb7679517e3172a1415998c80c9f4b65",
      },
    } as any,
    baseEnv as any
  )) as any;

  expect(res.status).toBe(successStatus);

  res = (await calculateFee(
    {
      url: "http://localhost/fee",
      method: "POST",
      headers: HEADERS,
      body: {
        instanceId: "pedrapapeltesoura123405432.testnet",
        receiverAccountId: "mmc-game03.testnet",
      },
    } as any,
    baseEnv as any
  )) as any;

  expect(res.status).toBe(errorStatus);
});
