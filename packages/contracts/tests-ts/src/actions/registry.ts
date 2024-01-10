import fs from "fs";
import { BN } from "near-workspaces";
import type { Account } from "near-api-js";
import {
  TREE_HEIGHT,
  ZERO_VALUE,
  PROTOCOL_FEE,
  RISK_PARAMS,
  Q,
  QF,
} from "../constants";

type Currency =
  | {
      type: "Near";
    }
  | {
      type: "Nep141";
      account_id: string;
    };

export const deployHapi = async ({
  account,
  owner,
}: {
  account: Account;
  owner: Account;
}): Promise<any> => {
  const contractWasm = fs.readFileSync("../proxy_contract_release.wasm");

  await account.deployContract(contractWasm);

  await account.functionCall({
    contractId: account.accountId,
    methodName: "new",
    args: {
      owner_id: owner.accountId,
    },
    gas: new BN("300000000000000"),
  });

  await owner.functionCall({
    contractId: account.accountId,
    methodName: "create_reporter",
    args: {
      address: owner.accountId,
      permission_level: 1,
    },
  });
};

export const deployRegistry = async ({
  account,
  owner,
  hapi,
}: {
  account: Account;
  owner: Account;
  hapi: Account;
}): Promise<any> => {
  const contractWasm = fs.readFileSync("../out/registry.wasm");

  await account.deployContract(contractWasm);

  await account.functionCall({
    contractId: account.accountId,
    methodName: "new",
    args: {
      owner: owner.accountId,
      authorizer: hapi.accountId,
      // vec of tupples (category, max_risk_threshold)
      risk_params: RISK_PARAMS,
      // merkle tree params
      height: TREE_HEIGHT,
      last_roots_len: 50,
      q: Q,
      zero_value: ZERO_VALUE,
    },
    gas: new BN("300000000000000"),
  });
};

export const addEntry = async ({
  registry,
  owner,
  currency,
  amount,
  instance,
}: {
  registry: Account;
  owner: Account;
  currency: Currency;
  amount: string;
  instance: Account;
}): Promise<any> => {
  return await owner.functionCall({
    contractId: registry.accountId,
    methodName: "add_entry",
    args: {
      currency,
      amount,
      account_id: instance.accountId,
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("1"),
  });
};

export const deployInstance = async ({
  account,
  owner,
  registry,
  currency,
  depositValue,
}: {
  account: Account;
  owner: Account;
  registry: Account;
  currency: Currency;
  depositValue: string;
}): Promise<any> => {
  const verifyKey = JSON.parse(
    fs.readFileSync("../../circuits/out/verification_key.json").toString()
  );
  const contractWasm = fs.readFileSync("../out/instance.wasm");
  await account.deployContract(contractWasm);
  await account.functionCall({
    contractId: account.accountId,
    methodName: "new",
    args: {
      owner: owner.accountId,
      registry: registry.accountId,
      height: TREE_HEIGHT,
      last_roots_len: 50,
      zero_value: ZERO_VALUE,
      currency,
      deposit_value: depositValue,
      percent_fee: PROTOCOL_FEE,
      power: verifyKey.power.toString(),
      n_public: verifyKey.nPublic.toString(),
      q_m: {
        x: verifyKey.Qm[0],
        y: verifyKey.Qm[1],
      },
      q_l: {
        x: verifyKey.Ql[0],
        y: verifyKey.Ql[1],
      },
      q_r: {
        x: verifyKey.Qr[0],
        y: verifyKey.Qr[1],
      },
      q_o: {
        x: verifyKey.Qo[0],
        y: verifyKey.Qo[1],
      },
      q_c: {
        x: verifyKey.Qc[0],
        y: verifyKey.Qc[1],
      },
      s_1: {
        x: verifyKey.S1[0],
        y: verifyKey.S1[1],
      },
      s_2: {
        x: verifyKey.S2[0],
        y: verifyKey.S2[1],
      },
      s_3: {
        x: verifyKey.S3[0],
        y: verifyKey.S3[1],
      },
      k_1: verifyKey.k1,
      k_2: verifyKey.k2,
      x_2: {
        x: [verifyKey.X_2[0][0], verifyKey.X_2[0][1]],
        y: [verifyKey.X_2[1][0], verifyKey.X_2[1][1]],
      },
      q: Q,
      qf: QF,
      w1: verifyKey.w,
    },
    gas: new BN("300000000000000"),
  });
};
