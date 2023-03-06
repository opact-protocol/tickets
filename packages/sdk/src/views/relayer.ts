import { viewFunction } from "../helpers";
import type { RelayerDataInterface } from "../interfaces";

export const viewRelayerHash = async (
  rpcUrl: string,
  contract: string,
  relayer: RelayerDataInterface
) => {
  return await viewFunction(rpcUrl, contract, "view_account_hash", {
    account_id: relayer.account,
  });
};
