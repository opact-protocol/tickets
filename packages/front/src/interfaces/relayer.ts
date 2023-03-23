import { RelayerDataInterface } from "hideyourcash-sdk";

export interface RelayerStore {
  fetchRelayerData: () => Promise<void>;
  setRelayerJWT: (token: string) => any;
  getRelayerFee: (
    accountId: string,
    instanceId: string,
    relayer: RelayerDataInterface
  ) => Promise<any>;
  createTimeout: (ms: number, address: string) => void;
  checkRelayerFee: (address: string) => void;
  loadingDynamicFee: boolean;
  dynamicFee: DynamicFee;
  relayerData: RelayerDataInterface;
  relayerJWT: string;
  recipientAddressError: string;
  toRef: any;
}

export interface DynamicFee {
  token: string;
  valid_fee_for_ms: number;
  human_network_fee: string;
  price_token_fee: string;
  formatted_user_will_receive: string;
  formatted_token_fee: string;
}
