import {
  createTicket,
  prepareMerkleTree,
  prepareWithdraw as prepareWithdrawAction,
  sendAllowlist,
  sendDeposit,
  sendWithdraw,
  sendContractWithdraw,
  getRelayerFee,
} from "../../actions";
import {
  lastDepositQuery,
  depositUpdatesQuery,
  allowListUpdatesQuery,
  lastAllowListQuery,
} from "../../graphql";
import type {
  ConnectionType,
  Currency,
  MerkleTreeCacheInterface,
  PublicArgsInterface,
  RelayerDataInterface,
  Logger,
} from "../../interfaces";
import { Views } from "./views";

export class Actions extends Views {
  readonly nodeUrl: string;
  readonly contract: string;
  readonly graphqlUrl?: string;
  readonly verifierUrl?: string;
  readonly circuitUrl?: string;

  constructor(
    nodeUrl: string,
    contract: string,
    graphqlUrl?: string,
    verifierUrl = "./verifier.wasm",
    circuitUrl = "./circuit.zkey"
  ) {
    super(nodeUrl, contract);

    this.nodeUrl = nodeUrl;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
    this.verifierUrl = verifierUrl;
    this.circuitUrl = circuitUrl;
  }

  async sendAllowlist(accountId: string, connection: ConnectionType) {
    return sendAllowlist(this.nodeUrl, this.contract, accountId, connection);
  }

  async createTicket(accountId: string, currencieContract: string) {
    return createTicket(
      this.nodeUrl,
      this.contract,
      accountId,
      currencieContract
    );
  }

  async sendDeposit(
    hash: string,
    amount: string,
    contract: string,
    accountId: string,
    currency: Currency,
    connection: ConnectionType
  ) {
    return sendDeposit(
      this.nodeUrl,
      hash,
      amount,
      contract,
      accountId,
      currency,
      connection
    );
  }

  async sendContractWithdraw(
    contract: string,
    signerId: string,
    receiverId: string,
    publicArgs: PublicArgsInterface,
    connection: ConnectionType
  ) {
    return sendContractWithdraw(
      this.nodeUrl,
      contract,
      signerId,
      receiverId,
      publicArgs,
      connection
    );
  }

  async getRelayerFee(
    relayer: RelayerDataInterface,
    accountId: string,
    instanceId: string
  ) {
    return getRelayerFee(relayer, accountId, instanceId);
  }

  async sendWithdraw(
    relayer: RelayerDataInterface,
    payload: { publicArgs: PublicArgsInterface; token: string }
  ) {
    return sendWithdraw(relayer, payload);
  }

  async prepareWithdraw(
    fee: string,
    note: string,
    relayer: RelayerDataInterface,
    recipient: string,
    currencyContract: string,
    logger: Logger,
    allowlistTreeCache?: MerkleTreeCacheInterface,
    commitmentsTreeCache?: MerkleTreeCacheInterface
  ) {
    if (!this.graphqlUrl) {
      throw new Error("Graphql URL not configured.");
    }

    const allowlistTree = await prepareMerkleTree(
      this.contract,
      "allowlistTree",
      allowListUpdatesQuery,
      lastAllowListQuery,
      this.graphqlUrl,
      allowlistTreeCache
    );

    const commitmentsTree = await prepareMerkleTree(
      currencyContract,
      "commitmentsTree",
      depositUpdatesQuery,
      lastDepositQuery,
      this.graphqlUrl,
      commitmentsTreeCache
    );

    const { publicArgs } = await prepareWithdrawAction(
      this.nodeUrl,
      currencyContract,
      fee,
      note,
      relayer,
      recipient,
      logger,
      allowlistTree,
      commitmentsTree,
      this.verifierUrl,
      this.circuitUrl
    );

    return publicArgs;
  }
}
