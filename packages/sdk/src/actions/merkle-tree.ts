import { MerkleTreeService } from '../services';
import type { MerkleTreeCacheInterface } from '../interfaces';

export const prepareMerkleTree = async (
  contract: string,
  name: string,
  branchesQuery: any,
  lastBranchesQuery: any,
  graphqlUrl: string,
  cache?: MerkleTreeCacheInterface,
) => {
  const merkleTree = new MerkleTreeService(
    contract,
    name,
    graphqlUrl,
    branchesQuery,
    lastBranchesQuery,
  );

  return (await merkleTree.initMerkleTree(cache)).tree;
}
