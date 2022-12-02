export interface NearConnectionConfiguration {
  networkId: string;
  nodeUrl: string;
}

export interface NearConfiguration {
  // Account used by this service to make contract function calls
  account: {
    id: string;
    keyPair: string;
  };

  connection: NearConnectionConfiguration;
}
