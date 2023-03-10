import { viewFunction } from "../helpers";
import type { PublicArgsInterface } from "../interfaces";

export const viewIsWithdrawValid = async (
  rpcUrl: string,
  contract: string,
  currencyContract: string,
  payload: PublicArgsInterface
): Promise<boolean> => {
  const withdrawIsValid = await viewFunction(
    rpcUrl,
    currencyContract,
    "view_is_withdraw_valid",
    payload
  );

  const rootAllowlistIsValid = await viewFunction(
    rpcUrl,
    contract,
    "view_is_allowlist_root_valid",
    {
      root: payload.allowlist_root,
    }
  );

  return withdrawIsValid && rootAllowlistIsValid;
};
