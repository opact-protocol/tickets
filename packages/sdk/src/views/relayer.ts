import { viewFunction } from "../helpers";
import type { RelayerDataInterface } from "../interfaces";

/**
 * View Relayer Hash
 *
 * This View Function return the hash of relayer accountId.
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The HYC registry accountId
 * @param relayer The data of relayer with Near accountId
 * @returns {Promise<any>}
 */
export const viewRelayerHash = async (
  rpcUrl: string,
  contract: string,
  relayer: RelayerDataInterface
) => {
  return await viewFunction(rpcUrl, contract, "view_account_hash", {
    account_id: relayer.account,
  });
};
