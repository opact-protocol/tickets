import { Actions } from "./actions";

/**
 * This class provides a common service with all actions and views methods
 */
export class HideyourCash extends Actions {
  readonly network: string;
  readonly nodeUrl: string;
  readonly contract: string;
  readonly graphqlUrl?: string;

  /**
   * Service constructor
   * @param network The near network
   * @param nodeUrl The Near RPC Url
   * @param contract The hideyour-cash registry contract
   * @param graphqlUrl The graphql url to get merkle tree branchs
   * @param verifierUrl The Url of verifier.wasm
   * @param circuitUrl The Url of circuit.zkey
   */
  constructor(
    network: string,
    nodeUrl: string,
    contract: string,
    graphqlUrl?: string,
    verifierUrl = "./verifier.wasm",
    circuitUrl = "./circuit.zkey"
  ) {
    super(nodeUrl, contract, graphqlUrl, verifierUrl, circuitUrl);

    this.network = network;
    this.nodeUrl = nodeUrl;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
  }
}
