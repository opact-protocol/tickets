import { MerkleTreeCacheInterface } from "@/interfaces";
import { MerkleTree } from "fixed-merkle-tree";
import { MerkleTreeService } from "./merkle-tree";
import {
  lastDepositQuery,
  depositUpdatesQuery,
  allowListUpdatesQuery,
  lastAllowListQuery,
} from "@/graphql";
import { prepareWithdraw as prepareWithdrawAction } from "@/actions";

export class HideyourCash {
  graphqlUrl: string;

  whitelistTree?: MerkleTree;
  commitmentsTree?: MerkleTree;

  constructor (
    graphqlUrl: string
  ) {
    this.graphqlUrl = graphqlUrl;
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

