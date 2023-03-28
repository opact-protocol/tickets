import { viewFunction } from "../helpers";

/**
 * View Fungible Token metadata
 * @param rpcUrl The Current Near RPC Url
 * @param contract The token accountId to get metadata
 * @returns {Promise<any>}
 */
export const viewFungibleTokenMetadata = async (
  rpcUrl: string,
  contract: string
): Promise<any> => {
  return await viewFunction(rpcUrl, contract, "ft_metadata");
};
