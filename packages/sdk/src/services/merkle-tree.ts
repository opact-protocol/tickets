import { request } from 'graphql-request'
import { merkleTreeOptions } from '../constants';
import { MerkleTree as FixedMerkleTree } from 'fixed-merkle-tree';
import type { MerkleTreeCacheInterface, MerkleTreeStorageInterface } from '../interfaces';
import { mimc } from './mimc';

export class MerkleTreeService {
  readonly name: string;
  readonly contract: string;
  readonly graphqlUrl: string;
  readonly branchesQuery: any;
  readonly lastBranchesQuery: any;

  tree: any | undefined;

  constructor (
    contract: string,
    name: string,
    graphqlUrl: string,
    branchesQuery: any,
    lastBranchesQuery: any,
  ) {
    this.name = name;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
    this.branchesQuery = branchesQuery;
    this.lastBranchesQuery = lastBranchesQuery;
  }

  async initMerkleTree (cache?: MerkleTreeCacheInterface) {
    const mimic = await mimc.initMimc();

    const items: MerkleTreeStorageInterface[] = await this.getBranches(cache);

    console.log(`Merkletree ${this.name} items: `, items);

    const tree = new FixedMerkleTree(20, [], {
      ...merkleTreeOptions,
      hashFunction: mimic.hash
    });

    if (items) {
      items.forEach(({ counter, value }) => {
        try {
          tree.update(+counter, value);
        } catch (e) {
          console.warn(e);

          throw new Error('Error when update Merkle Tree');
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

      console.log(`Merkletree ${this.name} - lastBranchIndex:`, lastBranchIndex);
      console.log(`Merkletree ${this.name} - startId:`, lastIndex);
      console.log(`Merkletree ${this.name} - first:`, qtyToQuer);

      const {
        [this.branchesQuery.name]: branches
      } =  await this.getMerkleTreeBranchesWithQuery(
        this.branchesQuery,
        {
          startId: String(lastIndex),
          first: qtyToQuer.toString(),
          contract: this.contract
        },
      );

      return [...defaultBranches, ...branches];
    }

    return [...defaultBranches];
  }

  async getLastBranchIndex (): Promise<number> {
    const data = await this.getMerkleTreeBranchesWithQuery(
      this.lastBranchesQuery,
      {
        contract: this.contract,
      }
    )

    const lastBranch = data[this.lastBranchesQuery.name][0]

    return lastBranch?.counter || '0';
  }

  async getMerkleTreeBranchesWithQuery (
    { query }: any,
    variables: any = {},
  ): Promise<any> {
    return request(this.graphqlUrl, query, variables as any) as any;
  }
}
