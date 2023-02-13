import fs from "fs";

/* tslint:disable */
export function readInputs() {
  return {
    commitment: JSON.parse(
      fs.readFileSync(
        "../../../../../contracts/testnet_seeder/temp/relayer-commitment.json",
        "utf8"
      )
    ),
    proof: JSON.parse(
      fs.readFileSync(
        "../../../../../contracts/testnet_seeder/temp/relayer-proof.json",
        "utf8"
      )
    ),
    publicArgs: JSON.parse(
      fs.readFileSync(
        "../../../../../contracts/testnet_seeder/temp/relayer-public.json",
        "utf8"
      )
    ),
    account: JSON.parse(
      fs.readFileSync(
        "../../../../../contracts/testnet_seeder/temp/relayer-user.json",
        "utf8"
      )
    ),
    contract: JSON.parse(
      fs.readFileSync(
        "../../../../../contracts/testnet_seeder/temp/relayer-contract.json",
        "utf8"
      )
    ),
  };
}
/* tslint:enable */

export async function deposit(
  contractAccount: any,
  account: any,
  commitment: any
) {
  return await account.functionCall({
    contractId: contractAccount.accountId,
    methodName: "deposit",
    args: {
      secrets_hash: commitment.secret_hash,
    },
    gas: "300000000000000",
    attachedDeposit: "10000000000000000000000000",
  });
}

export async function withdraw(
  contractAccount: any,
  account: any,
  receiver: any,
  relayer: any,
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
    gas: "300000000000000",
  });
}
