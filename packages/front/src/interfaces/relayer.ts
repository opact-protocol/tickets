import { RelayerDataInterface } from "hideyourcash-sdk";

export interface RelayerStore {
  fetchRelayerData: () => Promise<void>;
  setRelayerJWT: (token: string) => any;
  getRelayerFee: (
    accountId: string,
    instanceId: string,
    relayer: RelayerDataInterface
  ) => Promise<any>;
  relayerData: RelayerDataInterface;
  relayerJWT: string;
}
