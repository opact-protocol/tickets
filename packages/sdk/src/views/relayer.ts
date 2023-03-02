import { viewFunction } from '../helpers';
import type { RelayerDataInterface } from "../interfaces";

export const viewRelayerHash = (
  rpcUrl: string,
  contract: string,
  relayer: RelayerDataInterface,
) => {
  return viewFunction(
    rpcUrl,
    contract,
    "view_account_hash",
    {
      account_id: relayer.account,
    },
  );
}
