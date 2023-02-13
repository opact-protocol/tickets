import { HEADERS } from "@/constants";
import { fetch } from "@/services/router";
import payload from "./json/payload.json";

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

test("should return 402 - Error on withdraw", async () => {
  const env = getMiniflareBindings();

  const baseRequest = new Request("http://localhost/relay", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  const res = await fetch(baseRequest, env);

  const textRes = await res.text();

  expect(res.status).toBe(402);
  expect(textRes).toContain('{"status":"failure","error":"Error on withdraw"}');
});

// test("should return 200 - success withdraw", async () => {
//   const env = getMiniflareBindings();

//   const baseRequest = new Request('http://localhost/relay', {
//     method: 'POST',
//     headers: HEADERS,
//     body: JSON.stringify(payload),
//   });

//   const res = await fetch(baseRequest, env);

//   const textRes = await res.text();

//   expect(res.status).toBe(200);
//   expect(textRes).toContain('{"status":"success","error":"Error on withdraw"}');
// });
