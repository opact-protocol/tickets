import { BN, KeyPair, NearAccount } from "near-workspaces";
import fs from "fs";
import crypto from "crypto";
import type { UrlAccountCreator } from "near-api-js/lib/account_creator";
import type { Near, Account } from "near-api-js";

type Currency =
  | {
      type: "Near";
    }
  | {
      type: "Nep141";
      account_id: string;
    };

export const Q =
  "21888242871839275222246405745257275088548364400416034343698204186575808495617";
export const QF =
  "21888242871839275222246405745257275088696311157297823662689037894645226208583";
export const ZERO_VALUE =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292";
export const TREE_HEIGHT = 20;
export const HAPI_ONE_TESTNET = "proxy.hapi-npo.testnet";
export const RISK_PARAMS = [
  ["IllicitOrganization", 5],
  ["DarknetService", 5],
  ["Scam", 5],
  ["Ransomware", 5],
  ["Theft", 5],
  ["Counterfeit", 5],
  ["TerroristFinancing", 5],
  ["Sanctions", 5],
  ["ChildAbuse", 5],
];
export const PROTOCOL_FEE = "2000";
export const NEAR_DECIMALS = "000000000000000000000000";
export const FT_DECIMALS = "000000";

export async function createAccount(
  accountCreator: UrlAccountCreator,
  config: any,
  near: Near,
  account_id: string
): Promise<Account> {
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey();
  await config.deps.keyStore.setKey(config.networkId, account_id, keyPair);
  try {
    await accountCreator.createAccount(account_id, publicKey);
    return await near.account(account_id);
  } catch (err: any) {
    if (
      err.toString().includes("TooManyRequestsError:") ||
      err.toString().includes("Error: Server Error") ||
      err
        .toString()
        .includes(
          "The server encountered a temporary error and could not complete your request.<p>Please try again in"
        )
    ) {
      await sleep(1000 * 60 * 1);
      return await createAccount(accountCreator, config, near, account_id);
    } else {
      throw err;
    }
  }
}

export async function deployToken(
  account: Account,
  owner: Account
): Promise<void> {
  const contractWasm = fs.readFileSync("../../out/fungible_token.wasm");
  await account.deployContract(contractWasm);
  await account.functionCall({
    contractId: account.accountId,
    methodName: "new",
    args: {
      owner_id: owner.accountId,
      total_supply: "1000000000000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "test-USD",
        symbol: "tUSD",
        icon: "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='16' cy='16' r='16' fill='%232775C9'/%3E%3Cpath d='M15.75 27.5C9.26 27.5 4 22.24 4 15.75S9.26 4 15.75 4 27.5 9.26 27.5 15.75A11.75 11.75 0 0115.75 27.5zm-.7-16.11a2.58 2.58 0 00-2.45 2.47c0 1.21.74 2 2.31 2.33l1.1.26c1.07.25 1.51.61 1.51 1.22s-.77 1.21-1.77 1.21a1.9 1.9 0 01-1.8-.91.68.68 0 00-.61-.39h-.59a.35.35 0 00-.28.41 2.73 2.73 0 002.61 2.08v.84a.705.705 0 001.41 0v-.85a2.62 2.62 0 002.59-2.58c0-1.27-.73-2-2.46-2.37l-1-.22c-1-.25-1.47-.58-1.47-1.14 0-.56.6-1.18 1.6-1.18a1.64 1.64 0 011.59.81.8.8 0 00.72.46h.47a.42.42 0 00.31-.5 2.65 2.65 0 00-2.38-2v-.69a.705.705 0 00-1.41 0v.74zm-8.11 4.36a8.79 8.79 0 006 8.33h.14a.45.45 0 00.45-.45v-.21a.94.94 0 00-.58-.87 7.36 7.36 0 010-13.65.93.93 0 00.58-.86v-.23a.42.42 0 00-.56-.4 8.79 8.79 0 00-6.03 8.34zm17.62 0a8.79 8.79 0 00-6-8.32h-.15a.47.47 0 00-.47.47v.15a1 1 0 00.61.9 7.36 7.36 0 010 13.64 1 1 0 00-.6.89v.17a.47.47 0 00.62.44 8.79 8.79 0 005.99-8.34z' fill='%23FFF'/%3E%3C/g%3E%3C/svg%3E",
        decimals: 6,
      },
    },
    gas: new BN("300000000000000"),
  });
}

export async function deployRegistry(
  account: Account,
  owner: Account
): Promise<void> {
  const contractWasm = fs.readFileSync("../out/registry.wasm");
  await account.deployContract(contractWasm);
  await account.functionCall({
    contractId: account.accountId,
    methodName: "new",
    args: {
      owner: owner.accountId,
      authorizer: HAPI_ONE_TESTNET,
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
}

export async function deployInstance(
  account: Account,
  owner: Account,
  registry: Account,
  currency: Currency,
  deposit_value: string
): Promise<void> {
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
      deposit_value,
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
}

export async function addEntry(
  registryAccount: Account,
  owner: Account,
  currency: Currency,
  amount: string,
  instanceAccount: Account
): Promise<void> {
  await owner.functionCall({
    contractId: registryAccount.accountId,
    methodName: "add_entry",
    args: {
      currency,
      amount,
      account_id: instanceAccount.accountId,
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("1"),
  });
}

// function readInputs() {
//     return {
//         commitment1: JSON.parse(fs.readFileSync("temp/commitment1.json")),
//         commitment2: JSON.parse(fs.readFileSync("temp/commitment2.json")),
//         commitment3: JSON.parse(fs.readFileSync("temp/commitment3.json")),
//         commitment4: JSON.parse(fs.readFileSync("temp/commitment4.json")),
//         proof1: JSON.parse(fs.readFileSync("temp/proof1.json")),
//         proof2: JSON.parse(fs.readFileSync("temp/proof2.json")),
//         proof3: JSON.parse(fs.readFileSync("temp/proof3.json")),
//         proof4: JSON.parse(fs.readFileSync("temp/proof4.json")),
//         public1: JSON.parse(fs.readFileSync("temp/public1.json")),
//         public2: JSON.parse(fs.readFileSync("temp/public2.json")),
//         public3: JSON.parse(fs.readFileSync("temp/public3.json")),
//         public4: JSON.parse(fs.readFileSync("temp/public4.json")),
//     };
// }

async function registerUser(contractAccount: Account, account: Account) {
  return await account.functionCall({
    contractId: contractAccount.accountId,
    methodName: "allowlist",
    args: {
      account_id: account.accountId,
    },
    gas: new BN("300000000000000"),
  });
}

// async function deposit(contractAccount: Account, account: Account, commitment: string) {
//     return await account.functionCall({
//         contractId: contractAccount.accountId,
//         methodName: "deposit",
//         args: {
//             secrets_hash: commitment,
//         },
//         gas: new BN("300000000000000"),
//         attachedDeposit: new BN("10000000000000000000000000"),
//     });
// }

async function withdraw(
  contractAccount: Account,
  account: Account,
  receiver: Account,
  relayer: Account | null,
  proof: any,
  publicArgs: any
) {
  return await account.functionCall({
    contractId: contractAccount.accountId,
    methodName: "withdraw",
    args: {
      root: publicArgs[0],
      nullifier_hash: publicArgs[1],
      recipient: receiver.accountId,
      relayer: relayer ? relayer.accountId : null,
      fee: publicArgs[4],
      refund: publicArgs[5],
      allowlist_root: publicArgs[6],
      a: {
        x: proof["A"][0],
        y: proof["A"][1],
      },
      b: {
        x: proof["B"][0],
        y: proof["B"][1],
      },
      c: {
        x: proof["C"][0],
        y: proof["C"][1],
      },
      z: {
        x: proof["Z"][0],
        y: proof["Z"][1],
      },
      t_1: {
        x: proof["T1"][0],
        y: proof["T1"][1],
      },
      t_2: {
        x: proof["T2"][0],
        y: proof["T2"][1],
      },
      t_3: {
        x: proof["T3"][0],
        y: proof["T3"][1],
      },
      eval_a: proof["eval_a"],
      eval_b: proof["eval_b"],
      eval_c: proof["eval_c"],
      eval_s1: proof["eval_s1"],
      eval_s2: proof["eval_s2"],
      eval_zw: proof["eval_zw"],
      eval_r: proof["eval_r"],
      wxi: {
        x: proof["Wxi"][0],
        y: proof["Wxi"][1],
      },
      wxi_w: {
        x: proof["Wxiw"][0],
        y: proof["Wxiw"][1],
      },
    },
    gas: new BN("300000000000000"),
  });
}

export const addStorage = async (
  owner: Account,
  contract: Account,
  receiver: Account
) => {
  await owner.functionCall({
    contractId: contract.accountId,
    methodName: "storage_deposit",
    args: {
      account_id: receiver.accountId,
      registration_only: true,
    },
    attachedDeposit: new BN("10000000000000000000000"),
    gas: new BN(300000000000000),
  });
};

export const addMoney = async (
  owner: Account,
  tokenContractAccount: Account,
  sdkAccount: Account
) => {
  await owner.functionCall({
    contractId: tokenContractAccount.accountId,
    methodName: "ft_transfer",
    args: {
      receiver_id: sdkAccount.accountId,
      amount: "10000000000",
      memo: null,
    },
    attachedDeposit: "1" as any,
  });
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
