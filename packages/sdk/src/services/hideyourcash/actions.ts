
import {
  createTicket,
  prepareMerkleTree,
  prepareWithdraw as prepareWithdrawAction,
  sendAllowlist,
  sendDeposit,
  sendWithdraw,
  sendContractWithdraw
} from '../../actions';
import {
  lastDepositQuery,
  depositUpdatesQuery,
  allowListUpdatesQuery,
  lastAllowListQuery,
} from '../../graphql';
import type { ConnectionType, Currency, MerkleTreeCacheInterface, PublicArgsInterface, RelayerDataInterface } from '../../interfaces';
import { Views } from './views';

export class Actions extends Views {
  readonly nodeUrl: string;
  readonly contract: string;
  readonly graphqlUrl: string;

  constructor (
    nodeUrl: string,
    contract: string,
    graphqlUrl: string,
  ) {
    super(nodeUrl, contract);

    this.nodeUrl = nodeUrl;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
  }

  async sendAllowlist (
    accountId: string,
    connection: ConnectionType,
  ) {
    return sendAllowlist(
      this.contract,
      accountId,
      connection,
    );
  }

  async createTicket (
    accountId: string,
    currencieContract: string,
  ) {
    return createTicket(
      this.nodeUrl,
      this.contract,
      accountId,
      currencieContract,
    );
  }

  async sendDeposit (
    hash: string,
    amount: string,
    contract: string,
    accountId: string,
    currency: Currency,
    connection: ConnectionType,
  ) {
    return sendDeposit(
      this.nodeUrl,
      hash,
      amount,
      contract,
      accountId,
      currency,
      connection,
    );
  }

  async sendContractWithdraw (
    contract: string,
    signerId: string,
    receiverId: string,
    publicArgs: PublicArgsInterface,
    connection: ConnectionType,
  ) {
    return sendContractWithdraw(
      this.nodeUrl,
      contract,
      signerId,
      receiverId,
      publicArgs,
      connection,
    );
  }

  async sendWithdraw (
    relayer: RelayerDataInterface,
    publicArgs: PublicArgsInterface,
  ) {
    return sendWithdraw(
      relayer,
      publicArgs,
    );
  }

  async prepareWithdraw (
    note: string,
    relayer: RelayerDataInterface,
    recipient: string,
    allowlistTreeCache?: MerkleTreeCacheInterface,
    commitmentsTreeCache?: MerkleTreeCacheInterface,
  ) {
    console.log('building: allowlist tree');

    const allowlistTree = await prepareMerkleTree(
      'allowlistTree',
      allowListUpdatesQuery,
      lastAllowListQuery,
      this.graphqlUrl,
      allowlistTreeCache,
    );

    console.log('building: commitments tree');

    const commitmentsTree = await prepareMerkleTree(
      'commitmentsTree',
      depositUpdatesQuery,
      lastDepositQuery,
      this.graphqlUrl,
      commitmentsTreeCache,
    );

    console.log('generating withdraw inputs');

    const { publicArgs } = await prepareWithdrawAction(
      this.nodeUrl,
      this.contract,
      note,
      relayer,
      recipient,
      allowlistTree,
      commitmentsTree,
    );

    return publicArgs;
  }
}
