import testnetSetup from "./test_setup.json";
import withdrawPayload from "./withdraw_payload.json";
import { relayer } from "@/main";

const errorStatus = 500;
const successStatus = 200;

const HEADERS = {
  "Content-Type": "application/json",
};

const baseEnv = {
  RELAYER_FEE: "0.25",
  NEAR_NETWORK: "testnet",
  RPC_URL: "https://rpc.testnet.near.org",
  ACCOUNT_ID: testnetSetup.account.account_id,
  PRIVATE_KEY: testnetSetup.account.private_key,
};

test("should return error - should specify correct relayer address", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
        relayer: "foo.ba",
      },
      currencyContractId: testnetSetup.tokenInstance,
    },
  };

  const { body, status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(errorStatus);
  expect(body.error).toContain(
    `should specify correct relayer address: ${baseEnv.ACCOUNT_ID}`
  );
});

test("should return error - should at least minimum relayer fee", async () => {
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
      currencyContractId: testnetSetup.tokenInstance,
    },
  };

  const { body, status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(errorStatus);
  expect(body.error).toContain("should at least minimum relayer fee: 3");
});

test("should return error - Your withdraw payload is not valid", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
        nullifier_hash: "1234",
        fee: "3",
      },
      currencyContractId: testnetSetup.tokenInstance,
    },
  };

  const { body, status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(errorStatus);
  expect(body.error).toContain("Your withdraw payload is not valid");
});

test("should return sucess - withdraw", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: {
      publicArgs: {
        ...withdrawPayload,
      },
      currencyContractId: testnetSetup.tokenInstance,
    },
  };

  const { status } = await relayer(baseRequest as any, baseEnv as any);

  expect(status).toBe(successStatus);
}, 50000);
