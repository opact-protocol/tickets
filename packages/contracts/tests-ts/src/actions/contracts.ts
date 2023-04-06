import type { Account } from "near-api-js";
import { BN } from "near-workspaces";

export const registerUser = async ({
  contractAccount,
  account,
}: {
  contractAccount: Account;
  account: Account;
}): Promise<any> => {
  return await account.functionCall({
    contractId: contractAccount.accountId,
    methodName: "allowlist",
    args: {
      account_id: account.accountId,
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("480000000000000000000"),
  });
};

export const addStorage = async ({
  owner,
  contract,
  receiver,
}: {
  owner: Account;
  contract: Account;
  receiver: Account;
}): Promise<any> => {
  return await owner.functionCall({
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

export const addBalances = async (
  owner: Account,
  token: Account,
  receiver: Account
) => {
  await owner.functionCall({
    contractId: token.accountId,
    methodName: "ft_transfer",
    args: {
      receiver_id: receiver.accountId,
      amount: "10000000000",
      memo: null,
    },
    attachedDeposit: "1" as any,
  });
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
