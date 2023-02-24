import { viewFunction } from "@/helpers"

export const viewIsInAllowlist = (
  rpcUrl: string,
  contract: string,
  accountId: string,
): Promise<any> => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_is_in_allowlist',
    {
      account_id: accountId,
    },
  );
}

export const viewAccountHash = (
  rpcUrl: string,
  contract: string,
  accountId: string,
) => {
  return viewFunction(
    rpcUrl,
    contract,
    "view_account_hash",
    {
      account_id: accountId,
    },
  );
};
