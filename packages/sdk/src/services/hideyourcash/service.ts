import { Actions } from "./actions";
import { WalletSelector } from "@near-wallet-selector/core";

export class HideyourCash extends Actions {
  readonly network: string;
  readonly nodeUrl: string;
  readonly contract: string;
  readonly graphqlUrl: string;
  readonly connection: WalletSelector;

  constructor (
    network: string,
    nodeUrl: string,
    contract: string,
    graphqlUrl: string,
    connection: WalletSelector,
  ) {
    super(
      nodeUrl,
      contract,
      graphqlUrl,
    );

    this.network = network
    this.nodeUrl = nodeUrl;
    this.contract = contract;
    this.connection = connection;
    this.graphqlUrl = graphqlUrl;
  }
}
