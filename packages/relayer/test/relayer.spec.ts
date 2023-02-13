import { HEADERS } from "@/constants";
import { fetch } from "@/services/router";
import payload from "./json/payload.json";

import { connect, KeyPair } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { readInputs } from "./util";

let user;

const config = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

beforeAll(async () => {
  const { account } = readInputs();

  const keyStore = new InMemoryKeyStore();
  const keyPair = KeyPair.fromString(account.privateKey);
  keyStore.setKey(config.networkId, account.accountid, keyPair);

  user = await connect({
    ...config,
    keyStore,
  });

  console.log(user);
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
