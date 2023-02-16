import testnetSetup from "../temp/testnet_setup.json";

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
    `{"status":"failure","error":"should specify correct relayer address: ${baseEnvs.ACCOUNT_ID}"}`
  );
});

test("should return 402 - should at least minimum relayer fee", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      fee: 0,
      quantity: 10,
    }),
  });

  const res = await fetch(baseRequest, baseEnvs as any);

  const textRes = await res.text();
  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"should at least minimum relayer fee: 3"}'
  );
});

test("should return 402 - Withdraw is not valid", async () => {
  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...testnetSetup.user_withdraw_payload,
      nullifier_hash: "1234",
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
    }),
  });

  const res = await fetch(baseRequest, baseEnvs as any);

  expect(res.status).toBe(200);
}, 50000);
