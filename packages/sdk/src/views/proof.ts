import { viewFunction } from "@/helpers";

export const viewIsWithdrawValid = (
  rpcUrl: string,
  contract: string,
  payload: any
): Promise<any> => {
  return viewFunction(
    rpcUrl,
    contract,
    "view_is_withdraw_valid",
    payload
  );
};
