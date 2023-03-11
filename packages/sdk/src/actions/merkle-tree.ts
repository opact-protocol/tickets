import { MerkleTreeService } from "../services";
import type { MerkleTreeCacheInterface } from "../interfaces";
import type MerkleTree from "fixed-merkle-tree";

export const prepareMerkleTree = async (
  contract: string,
  name: string,
  branchesQuery: any,
  lastBranchesQuery: any,
  graphqlUrl: string,
  cache?: MerkleTreeCacheInterface
): Promise<MerkleTree> => {
  const merkleTree = new MerkleTreeService(
    contract,
    name,
    graphqlUrl,
    branchesQuery,
    lastBranchesQuery
  );

  return await merkleTree.initMerkleTree(cache);
};
