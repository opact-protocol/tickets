import { MerkleTreeCacheInterface } from "@/interfaces";
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
import { randomBN } from "@/helpers";

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

  async sendWhitelist () {
    //
  }

  async sendWithdraw () {
    //
  }

  async getRelayers () {
    //
  }

  async sendDeposit () {
    //
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

