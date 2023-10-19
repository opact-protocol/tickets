import { viewFunction } from "../helpers";

/**
 * View is in allowlist
 *
 * This View Function returns if accountId included on registry allowlist
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The contract accountId to be sent on view function
 * @param accountId The user accountId to check if is on allowlist
 * @returns {Promise<any>}
 */
export const viewIsInAllowlist = async (
  rpcUrl: string,
  contract: string,
  accountId: string
): Promise<any> => {
  return await viewFunction(rpcUrl, contract, "view_is_in_allowlist", {
    account_id: accountId,
  });
};

/**
 * View account hash
 *
 * This View Function returns a hash of an accountId.
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The contract accountId to be sent on view function
 * @param accountId The user accountId to be sent to get hash
 * @returns {Promise<any>}
 */
export const viewAccountHash = async (
  rpcUrl: string,
  contract: string,
  accountId: string
) => {
  return await viewFunction(rpcUrl, contract, "view_account_hash", {
    account_id: accountId,
  });
};

/**
 * View Account Balance
 *
 * This View Function returns the "Near" balance of an account.
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The contract accountId to be check balance
 * @param accountId The user accountId to get balance
 * @returns {Promise<any>}
 */
export const viewAccountBalance = async (
  rpcUrl: string,
  contract: string,
  accountId: string
) => {
  return await viewFunction(rpcUrl, contract, "ft_balance_of", {
    account_id: accountId,
  });
};
