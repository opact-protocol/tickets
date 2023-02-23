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
    }
  );
}
