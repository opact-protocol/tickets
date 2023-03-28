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

/**
 * This class provides common contract, graphql, node url, virifier url and circuit url for all actions
 */
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

  /**
   * Action Class - Send Allowlist
   * @param accountId The accountId to be send to allowlist
   * @param connection the near connection that will to sign the transactions (Near Account or Wallet Selector)
   * @returns {Promise<any>}
   */
  async sendAllowlist(accountId: string, connection: ConnectionType) {
    return sendAllowlist(this.nodeUrl, this.contract, accountId, connection);
  }

  /**
   * Action Class - Create Ticket
   * @param accountId The user accountId
   * @param currencyId The instance accountId to be send deposit
   * @returns {Promise<any>}
   */
  async createTicket(accountId: string, currencieContract: string, skip = false) {
    return createTicket(
      this.nodeUrl,
      this.contract,
      accountId,
      currencieContract,
      skip,
    );
  }

  /**
   * Action Class - Send Deposit
   * @param hash The generated deposit hash
   * @param amount The amount to be deposited
   * @param contract The instance accountId to be receive deposit
   * @param accountId The signer accountId of the transaction
   * @param currency The data of currency with token accountId
   * @param connection the near connection that will to sign the t
   * @returns {Promise<any>}
   */
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

  /**
   * Action Class - Send Contract Withdraw
   * @param contract The instance accountId to be send on transaction
   * @param signerId The signer accountId of the transaction
   * @param receiverId The receiver accountId of ticket amount
   * @param publicArgs The generated withdraw payload
   * @param connection the near connection that will to sign the transactions (Near Account or Wallet Selector)
   * @returns {Promise<any>}
   */
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

  /**
   * Action Class - Get Relayer Fee
   * @param relayer The data of relayer with the url to be requested fee
   * @param accountId The near accountId to be calculate fee
   * @param instanceId The instance accountId to be sended withdraw
   * @returns {Promise<any>}
   */
  async getRelayerFee(
    relayer: RelayerDataInterface,
    accountId: string,
    instanceId: string
  ) {
    return getRelayerFee(relayer, accountId, instanceId);
  }

  /**
   * Action Class - Send Withdraw
   * @param relayer The data of relayer with the url to be requested fee
   * @param payload The generated withdraw payload to be sended to withdraw
   * @returns {Promise<AxiosResponse>}
   */
  async sendWithdraw(
    relayer: RelayerDataInterface,
    payload: { publicArgs: PublicArgsInterface; token: string }
  ) {
    return sendWithdraw(relayer, payload);
  }

  /**
   * Action Class - Prepare Withdraw
   * @param fee The relayer fee generated of relayer
   * @param note The note to withdraw
   * @param relayer The data of relayer to be create the proof
   * @param recipient The receiver accountId of ticket amount
   * @param currencyContract The instance accountId
   * @param logger The logger instance
   * @param allowlistTreeCache The saved array of alowlist branches
   * @param commitmentsTreeCache The saved array of commitments branches
   * @returns {Promise<AxiosResponse>}
   */
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
