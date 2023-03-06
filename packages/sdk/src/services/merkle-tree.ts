import { request } from "graphql-request";
import MerkleTree, { MerkleTree as FixedMerkleTree } from "fixed-merkle-tree";
import type {
  MerkleTreeCacheInterface,
  MerkleTreeStorageInterface,
} from "../interfaces";
import { mimc as mimcService } from "./mimc";

export class MerkleTreeService {
  readonly name: string;
  readonly contract: string;
  readonly graphqlUrl: string;
  readonly branchesQuery: any;
  readonly lastBranchesQuery: any;

  tree: any | undefined;

  constructor(
    contract: string,
    name: string,
    graphqlUrl: string,
    branchesQuery: any,
    lastBranchesQuery: any
  ) {
    this.name = name;
    this.contract = contract;
    this.graphqlUrl = graphqlUrl;
    this.branchesQuery = branchesQuery;
    this.lastBranchesQuery = lastBranchesQuery;
  }

  async initMerkleTree(cache?: MerkleTreeCacheInterface): Promise<MerkleTree> {
    const { hash } = await mimcService.initMimc();

    const items: MerkleTreeStorageInterface[] = await this.getBranches(cache);

    console.log("items", items);

    const tree = new FixedMerkleTree(20, [], {
      zeroElement:
        "21663839004416932945382355908790599225266501822907911457504978515578255421292",
      hashFunction: hash,
    });

    if (items) {
      items.forEach(({ counter, value }) => {
        try {
          tree.update(Number(counter), value);
        } catch (e) {
          console.warn(e);

          throw new Error("Error when update Merkle Tree");
        }
      });
    }

    this.tree = tree;

    return tree;
  }

  async getBranches(cache?: MerkleTreeCacheInterface) {
    const { lastIndex = 0, branches: defaultBranches = [] } = cache || {};

    const lastBranchIndex = await this.getLastBranchIndex();

    if (!lastIndex || +lastIndex < +lastBranchIndex) {
      const qtyToQuer = +lastBranchIndex - lastIndex;

      const branches = await this.getMerkleTreeBranchesWithPaginatedQuery(
        this.branchesQuery,
        {
          startId: String(lastIndex),
          first: qtyToQuer.toString(),
          contract: this.contract,
        }
      );

      return [...defaultBranches, ...branches];
    }

    return [...defaultBranches];
  }

  async getLastBranchIndex(): Promise<number> {
    const data = await this.getMerkleTreeBranchesWithQuery(
      this.lastBranchesQuery,
      {
        contract: this.contract,
      }
    );

    const lastBranch = data[this.lastBranchesQuery.name][0];

    return lastBranch?.counter || "0";
  }

  async getMerkleTreeBranchesWithQuery(
    { query }: any,
    variables: any = {}
  ): Promise<any> {
    return request(this.graphqlUrl, query, variables as any) as any;
  }

  async getMerkleTreeBranchesWithPaginatedQuery(
    { query }: any,
    variables: any = {}
  ) {
    const rawPage = (Number(variables.first) + 100 - 1) / 100;

    const totalPage = Number(
      (rawPage % 1 === 0 ? rawPage : rawPage + 1).toFixed(0)
    );

    const branches: any[] = [];

    for (let i = 0; i < totalPage; i++) {
      const { [this.branchesQuery.name]: data } = (await request(
        this.graphqlUrl,
        query,
        {
          ...variables,
          startId: String(Number(variables.startId) + 100 * i),
        } as any
      )) as any;

      branches.push(...data);
    }

    return branches;
  }
}
