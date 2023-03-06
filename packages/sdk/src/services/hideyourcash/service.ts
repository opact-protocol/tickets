import { Actions } from "./actions";

export class HideyourCash extends Actions {
  readonly network: string;
  readonly nodeUrl: string;
  readonly contract: string;
  readonly graphqlUrl?: string;

  constructor(
    network: string,
    nodeUrl: string,
    contract: string,
    graphqlUrl?: string
  ) {
    super(nodeUrl, contract, graphqlUrl);

    this.network = network;
    this.nodeUrl = nodeUrl;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
  }
}
