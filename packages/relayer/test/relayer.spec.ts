import { getRouter } from "@/index";
import testnetSetup from "../temp/testnet_setup.json";

const router = getRouter();

const errorStatus = 500;
const successStatus = 200;

const HEADERS = {
  "Content-Type": "application/json",
};

const baseEnvs = {
  RELAYER_FEE: "0.25",
  NEAR_NETWORK: "testnet",
  RPC_URL: "https://rpc.testnet.near.org",
  ACCOUNT_ID: testnetSetup.relayer.account_id,
  PRIVATE_KEY: testnetSetup.relayer.private_key,
  HYC_CONTRACT: testnetSetup.hyc_contract,
};

test("should return error - payload not is valid", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
  });

  const res = await router.handle(baseEnvs as any, baseRequest);

  const textRes = await res.text();

  console.log(textRes);

  expect(res.status).toBe(errorStatus);
  expect(textRes).toContain(
    '{"status":"failure","error":"Your withdraw payload is not valid"}'
  );
});

test("should return error - should specify correct relayer address", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      relayer: "foo.ba",
    }),
  });

  const res = await router.handle(baseEnvs as any, baseRequest);

  const textRes = await res.text();

  expect(res.status).toBe(errorStatus);
  expect(textRes).toContain(
    `{"status":"failure","error":"should specify correct relayer address: ${baseEnvs.ACCOUNT_ID}"}`
  );
});

test("should return error - should at least minimum relayer fee", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      fee: 0,
      quantity: 10,
    }),
  });

  const res = await router.handle(baseEnvs as any, baseRequest);

  const textRes = await res.text();
  expect(res.status).toBe(errorStatus);
  expect(textRes).toContain(
    '{"status":"failure","error":"should at least minimum relayer fee: 3"}'
  );
});

test("should return error - Withdraw is not valid", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      nullifier_hash: "1234",
      fee: "3",
    }),
  });

  const res = await router.handle(baseEnvs as any, baseRequest);

  const textRes = await res.text();

  expect(res.status).toBe(errorStatus);
  expect(textRes).toContain(
    '{"status":"failure","error":"Withdraw is not valid"}'
  );
});

test("should return sucess - withdraw", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
    }),
  });

  const res = await router.handle(baseEnvs as any, baseRequest);

  expect(res.status).toBe(successStatus);
}, 50000);
