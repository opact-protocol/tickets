import { HEADERS } from "@/constants";
import { fetch } from "@/services/router";
import testnetSetup from "../temp/testnet_setup.json";

const baseEnvs = {
  RELAYER_FEE: "0.25",
  NEAR_NETWORK: "testnet",
  RPC_URL: "https://rpc.testnet.near.org",
  ACCOUNT_ID: "ade0e80e6ba045a93e69owner.testnet",
  PRIVATE_KEY:
    "ed25519:3GmSyXipyFfiabnVjmbXv17oa7NAx38tELqFEqdjsJ6EKsLWSs8kgpRb89W8nZqV1diMwmFFygMN7HKVUoaKcFu7",
  HYC_CONTRACT: testnetSetup.hyc_contract,
};

test("should return 402 - payload not is valid", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
  });

  const res = await fetch(baseRequest, baseEnvs as any);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"payload not is valid"}'
  );
});

test("should return 402 - should specify correct relayer address", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      relayer: "foo.ba",
    }),
  });

  const res = await fetch(baseRequest, baseEnvs as any);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"should specify correct relayer address: ade0e80e6ba045a93e69owner.testnet"}'
  );
});

test("should return 402 - should at least minimum relayer fee", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      relayer: baseEnvs.ACCOUNT_ID,
      quantity: 3,
    }),
  });

  const res = await fetch(baseRequest, baseEnvs as any);

  const textRes = await res.text();
  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"should at least minimum relayer fee: 1"}'
  );
});

test("should return 402 - Withdraw is not valid", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      nullifier_hash: "1234",
      relayer: baseEnvs.ACCOUNT_ID,
      fee: "3",
    }),
  });

  const res = await fetch(baseRequest, baseEnvs as any);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"Withdraw is not valid"}'
  );
});

test("should return 200 - success withdraw", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      relayer: baseEnvs.ACCOUNT_ID,
      fee: "3",
    }),
  });
  const res = await fetch(baseRequest, baseEnvs as any);

  expect(res.status).toBe(200);
}, 50000);
