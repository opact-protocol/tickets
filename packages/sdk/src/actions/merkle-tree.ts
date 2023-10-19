import { MerkleTreeService } from "../services";
import type { MerkleTreeCacheInterface } from "../interfaces";
import type MerkleTree from "fixed-merkle-tree";

/**
 * Prepare Merkle Tree
 *
 * This method is responsible for creating and starting a new merkle tree using the Merkle Tree service.
 *
 * @param contract The accountId of registry contract
 * @param name The name of to be created merkle tree
 * @param branchesQuery The graphql query to get all branches
 * @param lastBranchesQuery The graphql query to get only the last branch
 * @param graphqlUrl The graphql url
 * @param cache The saved array of branches
 * @returns {Promise<MerkleTree>}
 */
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
