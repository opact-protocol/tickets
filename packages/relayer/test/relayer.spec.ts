import { HEADERS } from "@/constants";
import { fetch } from "@/services/router";
import payload from "./json/payload.json";
import core from "@actions/core";

// import { connect, KeyPair } from "near-api-js";
// import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
// let user;

beforeAll(async () => {
  const { isActions } = getMiniflareBindings();

  if (isActions) {
    const proof = core.getState("USER_PROOF");
    const hycPrivate = core.getState("HYC_PRIVATE_KEY");
    const hycAccountId = core.getState("HYC_ACCOUNT_ID");

    console.log(proof, hycPrivate, hycAccountId);
  }

  // const keyStore = new InMemoryKeyStore();
  // const keyPair = KeyPair.fromString(account.privateKey);
  // keyStore.setKey(config.networkId, account.accountid, keyPair);

  // user = await connect({
  //   ...config,
  //   keyStore,
  // });

  // console.log(commitment, proof, publicArgs);
});

test("should return 402 - payload not is valid", async () => {
  const env = getMiniflareBindings();

  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
  });

  const res = await fetch(baseRequest, env);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"payload not is valid"}'
  );
});

test("should return 402 - should specify correct relayer address", async () => {
  const env = getMiniflareBindings();

  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ ...payload, relayer: "foo.ba" }),
  });

  const res = await fetch(baseRequest, env);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"should specify correct relayer address: ade0e80e6ba045a93e69owner.testnet"}'
  );
});

test("should return 402 - should at least minimum relayer fee", async () => {
  const env = getMiniflareBindings();

  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      ...payload,
      relayer: "ade0e80e6ba045a93e69owner.testnet",
    }),
  });

  const res = await fetch(baseRequest, env);

  console.log(res);
});

test("should return 402 - Withdraw is not valid", async () => {
  const env = getMiniflareBindings();

  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  const res = await fetch(baseRequest, env);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain(
    '{"status":"failure","error":"Withdraw is not valid"}'
  );
});

// test("should return 402 - Error on withdraw", async () => {
//   const env = getMiniflareBindings();

//   const baseRequest = new Request("http://localhost/relay", {
//     method: "POST",
//     headers: HEADERS,
//     body: JSON.stringify(payload),
//   });

//   const res = await fetch(baseRequest, env);

//   const textRes = await res.text();

//   expect(res.status).toBe(402);
//   expect(textRes).toContain('{"status":"failure","error":"Error on withdraw"}');
// });

// test("should return 200 - success withdraw", async () => {
//   const env = getMiniflareBindings();

//   const baseRequest = new Request("http://localhost/relay", {
//     method: "POST",
//     headers: HEADERS,
//     body: JSON.stringify(payload),
//   });

//   const res = await fetch(baseRequest, env);

//   expect(res.status).toBe(200);
// });
