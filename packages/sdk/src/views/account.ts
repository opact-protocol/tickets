import { viewFunction } from "../helpers";

export const viewIsInAllowlist = async (
  rpcUrl: string,
  contract: string,
  accountId: string
): Promise<any> => {
  return await viewFunction(rpcUrl, contract, "view_is_in_allowlist", {
    account_id: accountId,
  });
};

export const viewAccountHash = async (
  rpcUrl: string,
  contract: string,
  accountId: string
) => {
  return await viewFunction(rpcUrl, contract, "view_account_hash", {
    account_id: accountId,
  });
};

export const viewAccountBalance = async (
  rpcUrl: string,
  contract: string,
  accountId: string
) => {
  return await viewFunction(rpcUrl, contract, "ft_balance_of", {
    account_id: accountId,
  });
};
