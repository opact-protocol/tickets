import { graphqlUrl, merkleTreeBaseRequest, merkleTreeOptions } from "@/constants";
import { MerkleTreeStorageInterface } from "@/interfaces";
import { MerkleTree as FixedMerkleTree } from "fixed-merkle-tree";
import { allowListUpdatesQuery, depositUpdatesQuery, lastAllowListQuery, lastDepositQuery } from '@/graphql';

export class MerkleTree {
  whitelistTree: any | undefined;
  commitmentsTree: any | undefined;

  async initMerkleTree () {
    const deposits: MerkleTreeStorageInterface[] = await this.getDeposits();

    const allowlists: MerkleTreeStorageInterface[] = await this.getAllowList();

    const commitmentsTree = new FixedMerkleTree(20, [], merkleTreeOptions);

    if (deposits) {
      deposits.forEach(({ index, value }) => {
        try {
          commitmentsTree.update(+index, value);
        } catch (e) {
          console.warn(e);
        }
      });
    }

    const whitelistTree = new FixedMerkleTree(20, [], merkleTreeOptions);

    if (allowlists) {
      allowlists.forEach(({ index, value }) => {
        try {
          whitelistTree.update(+index, value);
        } catch (e) {
          console.warn(e);
        }
      });
    }

    this.whitelistTree = whitelistTree;

    this.commitmentsTree = commitmentsTree;

    return { commitmentsTree, whitelistTree }
  }

  async getDeposits () {
    const lastDeposit = await this.getLastDeposit();

    const qtyToQuer = +lastDeposit;

    return await this.getMerkleTreeDataForQuery(
      depositUpdatesQuery,
      {
        startId: "0",
        first: qtyToQuer.toString(),
      },
    );
  }

  async getAllowList () {
    const lastAllowlist = await this.getLastAllowlist();

    const qtyToQuer = +lastAllowlist;

    return await this.getMerkleTreeDataForQuery(
      allowListUpdatesQuery,
      {
        startId: "0",
        first: qtyToQuer.toString(),
      },
    );
  }

  async getLastDeposit () {
    const { data } = await this.getMerkleTreeDataForQuery(
      lastDepositQuery,
    )

    return data.depositMerkleTreeUpdates[0].counter;
  }

  async getLastAllowlist () {
    const { data } = await this.getMerkleTreeDataForQuery(
      lastAllowListQuery,
    )

    return data.allowlistMerkleTreeUpdates[0].counter;
  }

  async getMerkleTreeDataForQuery (
    query: any,
    variables: any = {},
  ): Promise<any> {
    const graphqlQuery = {
      query,
      variables,
    };

    const res = await fetch(
      graphqlUrl,
      {
        ...merkleTreeBaseRequest,
        body: JSON.stringify(graphqlQuery),
      },
    );

    return res.json();
  }
}
