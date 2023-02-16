import testnetSetup from "../temp/testnet_setup.json";
import { relayer } from "@/main";

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

test("should return error - should specify correct relayer address", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      relayer: "foo.ba",
    }),
  };

  const { body, status } = await relayer(baseRequest as any, baseEnvs as any);

  expect(status).toBe(errorStatus);
  expect(body).toContain(
    `{"status":"failure","error":"should specify correct relayer address: ${baseEnvs.ACCOUNT_ID}"}`
  );
});

test("should return error - should at least minimum relayer fee", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      fee: 0,
      quantity: 10,
    }),
  };

  const { body, status } = await relayer(baseRequest as any, baseEnvs as any);

  expect(status).toBe(errorStatus);
  expect(body).toContain(
    '{"status":"failure","error":"should at least minimum relayer fee: 3"}'
  );
});

test("should return error - Your withdraw payload is not valid", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      nullifier_hash: "1234",
      fee: "3",
    }),
  };

  const { body, status } = await relayer(baseRequest as any, baseEnvs as any);

  expect(status).toBe(errorStatus);
  expect(body).toContain(
    '{"status":"failure","error":"Your withdraw payload is not valid"}'
  );
});

test("should return sucess - withdraw", async () => {
  const baseRequest = {
    url: "http://localhost/relay",
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
    }),
  };

  const { status } = await relayer(baseRequest as any, baseEnvs as any);

  expect(status).toBe(successStatus);
}, 50000);
