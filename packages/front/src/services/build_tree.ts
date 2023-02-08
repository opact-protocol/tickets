import { MerkleTree } from "fixed-merkle-tree";
import { mimc } from "./mimc";
import { allowlistStorage, depositsStorage } from "@/utils/set-storages";

const MERKLE_TREE_OPTIONS = {
  zeroElement:
    "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  hashFunction: mimc.hash
};

export async function buildTree() {
  await mimc.initMimc();

  const deposits = await depositsStorage();

  const allowlists = await allowlistStorage();

      const allowlists = await getAllowLists(
        lastIndex || "0",
        lenStorage.toString()
      );

  if (deposits)
    deposits.forEach(({ index, value }) => {
      try {
        commitmentsTree.update(+index, value);
      } catch (e) {
        console.warn(e);
      }
    });

  if (deposits)
    deposits.forEach(({ index, value }) => {
      try {
        commitmentsTree.update(+index, value);
      } catch (e) {
        console.warn(e);
      }
    });

  const whitelistTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  if (allowlists)
    allowlists.forEach(({ index, value }) => {
      try {
        whitelistTree.update(+index, value);
      } catch (e) {
        console.warn(e);
      }
    });

  return { commitmentsTree, whitelistTree };
}
