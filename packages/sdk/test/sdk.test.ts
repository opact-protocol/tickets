import { setupNear } from "./utils";
import { HideyourCash, mimc } from "../src";
import path from "path";
import env from "./test_setup.json";
import fs from "fs";
import { describe, expect, jest, beforeAll, it } from '@jest/globals';

describe("Test all service actions", () => {
  jest.setTimeout(1000000000);

  let account: any = null;
  let connection: any = null;
  let service: HideyourCash | null = null;

  beforeAll(async () => {
    // setup NEAR config
    connection = await setupNear({
      RPC_URL: "https://archival-rpc.testnet.near.org",
      ACCOUNT_ID: env.account.account_id,
      PRIVATE_KEY: env.account.private_key,
      NEAR_NETWORK: "testnet",
    });

    // load near account
    account = await connection.account(env.account.account_id);

    // init hideyourcash service
    service = new HideyourCash(
      "testnet",
      "https://rpc.testnet.near.org",
      env.hyc_contract,
      "https://api.thegraph.com/subgraphs/name/veigajoao/test_hyc_registry",
      path.resolve(__dirname, "./verifier.wasm"),
      path.resolve(__dirname, "./circuit.zkey")
    );
  });

  it("1. Test service flow", async () => {
    console.log("view is in allowlist");

    let checkInAllowlist = await service?.viewIsInAllowlist(
      env.account.account_id
    );

    expect(checkInAllowlist).toBe(false);

    await service?.sendAllowlist(env.account.account_id, account);

    console.log("view is in allowlist again");

    checkInAllowlist = await service?.viewIsInAllowlist(env.account.account_id);

    expect(checkInAllowlist).toBe(true);

    console.log("validate currencies");

    const currencies = (await service?.viewAllCurrencies()) || [];

    currencies?.forEach((currency) => {
      const keys = Object.keys(currency);

      expect(keys).toContain("type");
    });

    const currency = currencies[0];

    console.log("Create ticket");

    const { hash = "", note = "" } =
      (await service?.createTicket(
        env.account.account_id,
        currency.account_id || "near"
      )) || {};

    const amount = "10000000";

    const currencyId = currency.contracts[amount];

    console.log("view is contract allowed");

    await service?.viewIsContractAllowed(currencyId);

    console.log("send deposit");

    await service?.sendDeposit(
      hash,
      amount,
      currencyId,
      env.account.account_id,
      currency,
      account
    );

    const [relayer] = (await service?.getRandomRelayer("test")) || [];

    console.log("prepare withdraw");

    const { hash: mimcHash } = await mimc.initMimc();

    const allowListBranches = [
      ...(env.cache.accountsHashes.map((hash, i) => ({
        counter: i,
        value: hash,
      })) as any),
      {
        counter: "1",
        value: await service?.viewAccountHash(env.account.account_id),
      },
    ];

    const commitmentsBranches = [
      ...(env.cache.commitmentLeaves.map((hash, i) => ({
        counter: i,
        value: hash,
      })) as any),
      {
        counter: "4",
        value: mimcHash(hash, note.split("-")[3]),
      },
    ];

    const publicArgs = await service?.prepareWithdraw(
      "1000000",
      note,
      {
        ...relayer,
        account: env.account.account_id,
      },
      env.account.account_id,
      currencyId,
      {
        branches: allowListBranches,
      } as any,
      {
        branches: commitmentsBranches,
      } as any
    );

    console.log("viewIsWithdrawValid");

    const withdrawIsValid = await service?.viewIsWithdrawValid(
      publicArgs!,
      currencyId
    );

    expect(withdrawIsValid).toBe(true);

    fs.writeFileSync(
      "../relayer/test/withdraw_payload.json",
      JSON.stringify(publicArgs!)
    );
  });
});
