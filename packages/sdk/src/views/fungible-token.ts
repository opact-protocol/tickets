import { viewFunction } from "../helpers";

export const viewFungibleTokenMetadata = async (
  rpcUrl: string,
  contract: string
): Promise<any> => {
  return await viewFunction(rpcUrl, contract, "ft_metadata");
};
