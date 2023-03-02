import { viewFunction } from "../helpers";

export const viewFungibleTokenMetadata = (
  rpcUrl: string,
  contract: string,
): Promise<any> => {
  return viewFunction(
    rpcUrl,
    contract,
    'ft_metadata',
  );
};
