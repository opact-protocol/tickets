import { MerkleTreeCacheInterface, PublicArgsInterface } from "@/interfaces";
import { MerkleTreeService } from "./merkle-tree";
import {
  lastDepositQuery,
  depositUpdatesQuery,
  allowListUpdatesQuery,
  lastAllowListQuery,
} from "@/graphql";
import { prepareWithdraw as prepareWithdrawAction } from "@/actions";
import { viewAccountHash } from "@/views";
import { mimc } from "@/services";
import { getTransaction, randomBN } from "@/helpers";
import { RelayerBaseRequest } from "@/constants/relayer";
import { WalletSelector } from "@near-wallet-selector/core";

const baseRelayers = {
  test: 'https://prod-relayer.hideyourcash.workers.dev/',
  prod: 'https://dev-relayer.hideyourcash.workers.dev/',
}

export class HideyourCash {
  readonly network: string;
  readonly nodeUrl: string;
  readonly contract: string;
  readonly graphqlUrl: string;

  constructor (
    network: string,
    nodeUrl: string,
    contract: string,
    graphqlUrl: string,
  ) {
    this.network = network
    this.nodeUrl = nodeUrl;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
  }

  async sendWhitelist (
    accountId: string,
    connection: WalletSelector,
  ) {
    const wallet = await connection.wallet();

    const transactions: any[] = [];

    transactions.push(
      getTransaction(
        accountId,
        this.contract,
        "allowlist",
        {
          account_id: accountId,
        },
      )
    );

    wallet.signAndSendTransactions({
      transactions,
    });
  }

  async sendDeposit (
    hash: string,
    amount: string,
    contract: string,
    accountId: string,
    connection: WalletSelector,
  ) {
    const wallet = await connection.wallet();

    const transactions: any[] = [];

    transactions.push(
      getTransaction(
        accountId,
        contract,
        "deposit",
        {
          secrets_hash: hash,
        },
        amount
      )
    );

    wallet.signAndSendTransactions({
      transactions,
    });
  }

  async getRelayers (network: 'test' | 'prod' = 'test') {
    return await fetch(baseRelayers[network] + '/data', {
      ...RelayerBaseRequest
    });
  }

  async sendWithdraw (
    relayerUrl: string,
    publicArgs: PublicArgsInterface
  ) {
    return await fetch(
      relayerUrl,
      {
        ...RelayerBaseRequest,
        body: JSON.stringify(publicArgs)
      }
    )
  }

  async prepareDeposit (
    accountId: string
  ) {
    const secret = randomBN();
    const nullifier = randomBN();

    const secrets_hash = mimc.hash!(secret, nullifier);

    const accountHash = await viewAccountHash(
      this.nodeUrl,
      this.contract,
      accountId,
    )

    //contract-secret-nullifier-account
    const note =
      secret.toString() +
      "-" +
      nullifier.toString() +
      "-" +
      accountHash.toString();

    return {
      note,
      hash: secrets_hash,
    };
  }

  async prepareWithdraw (
    note: string,
    relayer: string,
    recipient: string,
    whitelistTreeCache?: MerkleTreeCacheInterface,
    commitmentsTreeCache?: MerkleTreeCacheInterface,
  ) {
    const whitelistTree = await this.prepareMerkleTree(
      'whitelistTree',
      allowListUpdatesQuery,
      lastAllowListQuery,
      whitelistTreeCache,
    );

    const commitmentsTree = await this.prepareMerkleTree(
      'commitmentsTree',
      depositUpdatesQuery,
      lastDepositQuery,
      commitmentsTreeCache,
    );

    const { publicArgs } = await prepareWithdrawAction(
      note,
      relayer,
      recipient,
      whitelistTree,
      commitmentsTree,
    );

    return publicArgs;
  }

  async prepareMerkleTree (
    name: string,
    branchesQuery: any,
    lastBranchesQuery: any,
    cache?: MerkleTreeCacheInterface,
  ) {
    const merkleTree = new MerkleTreeService(
      name,
      this.graphqlUrl,
      branchesQuery,
      lastBranchesQuery,
    );

    return (await merkleTree.initMerkleTree(cache)).tree;
  }
}

