import { viewFunction } from "@/helpers";
import { RelayerDataInterface } from "@/interfaces";

export const viewRelayerData = async (
  relayerUrl: string,
) => {
  const res = await fetch(relayerUrl);

  return res.json();
}

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
