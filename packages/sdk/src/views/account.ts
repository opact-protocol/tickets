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
