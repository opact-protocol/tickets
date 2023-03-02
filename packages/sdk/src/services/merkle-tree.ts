import { request } from 'graphql-request'
import { merkleTreeOptions } from '../constants';
import { MerkleTree as FixedMerkleTree } from 'fixed-merkle-tree';
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

      const {
        [this.branchesQuery.name]: branches
      } =  await this.getMerkleTreeBranchesWithQuery(
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
    const data = await this.getMerkleTreeBranchesWithQuery(
      this.lastBranchesQuery,
    )

    return data[this.lastBranchesQuery.name][0].counter;
  }

  async getMerkleTreeBranchesWithQuery (
    { query }: any,
    variables: any = {},
  ): Promise<any> {
    return request(this.graphqlUrl, query, variables as any) as any;
  }
}
