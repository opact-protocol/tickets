import { viewFunction } from '../helpers';

export const viewIsWithdrawValid = async (
  rpcUrl: string,
  contract: string,
  payload: any
): Promise<boolean> => {
  const foo = await viewFunction(
    rpcUrl,
    contract,
    "view_is_withdraw_valid",
    payload,
  );

  const baa = await viewFunction(
    rpcUrl,
    'registry',
    'view_is_allowlist_root_valid',
    payload.allowlist_root,
  );

  return foo && baa;
};
