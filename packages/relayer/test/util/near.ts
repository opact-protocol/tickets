export const config = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

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
