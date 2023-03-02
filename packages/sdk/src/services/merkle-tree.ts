import fetch from 'node-fetch';
import { MerkleTree as FixedMerkleTree } from 'fixed-merkle-tree';
import { merkleTreeBaseRequest, merkleTreeOptions } from '../constants';
import type { MerkleTreeCacheInterface, MerkleTreeStorageInterface } from '../interfaces';

export class MerkleTreeService {
  readonly name: string;
  readonly graphqlUrl: string;
  readonly branchesQuery: any;
  readonly lastBranchesQuery: any;

  tree: any | undefined;

  constructor (
    name: string,
    graphqlUrl: string,
    branchesQuery: any,
    lastBranchesQuery: any,
  ) {
    this.name = name;
    this.graphqlUrl = graphqlUrl;
    this.branchesQuery = branchesQuery;
    this.lastBranchesQuery = lastBranchesQuery;
  }

  async initMerkleTree (cache?: MerkleTreeCacheInterface) {
    const items: MerkleTreeStorageInterface[] = await this.getBranches(cache);

    const tree = new FixedMerkleTree(20, [], merkleTreeOptions);

    if (items) {
      items.forEach(({ index, value }) => {
        try {
          tree.update(+index, value);
        } catch (e) {
          console.warn(e);
        }
      });
    }

    this.tree = tree;

    return { tree }
  }

  async getBranches (cache?: MerkleTreeCacheInterface) {
    const {
      lastIndex = 0,
      branches: defaultBranches = [],
    } = cache || {};

    const lastBranchIndex = await this.getLastBranchIndex();

    if (!lastIndex || +lastIndex < +lastBranchIndex) {
      const qtyToQuer = +lastBranchIndex - lastIndex;

      const branches =  await this.getMerkleTreeBranchesWithQuery(
        'lastMerkleTreeUpdates',
        this.branchesQuery,
        {
          startId: lastBranchIndex || "0",
          first: qtyToQuer.toString(),
        },
      );

      return [...defaultBranches, ...branches];
    }

    return [...defaultBranches];
  }

  async getLastBranchIndex (): Promise<number> {
    const { data } = await this.getMerkleTreeBranchesWithQuery(
      'depositMerkleTreeUpdates',
      this.lastBranchesQuery,
    )

    return data.depositMerkleTreeUpdates[0].counter;
  }

  async getMerkleTreeBranchesWithQuery (
    name: string,
    query: any,
    variables: any = {},
  ): Promise<any> {
    const graphqlQuery = {
      query,
      variables,
      name: name,
    };

    const res = await fetch(
      this.graphqlUrl,
      {
        ...merkleTreeBaseRequest,
        body: JSON.stringify(graphqlQuery),
      },
    );

    return res.json();
  }
}
