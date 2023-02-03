import { MerkleTree } from "fixed-merkle-tree";
import { mimc } from "./mimc";
import { allowlistStorage, depositsStorage } from "@/utils/set-storages";

//91695101196055581268382340748056401776004274439388412880966858487328554558-401452449107236067392139553668996423577369148609296120750795829587588617446-162475806477117712551925872439679393948340352152953499348005487663576363087

const MERKLE_TREE_OPTIONS = {
  zeroElement:
    "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  hashFunction: mimc.hash,
};

export async function buildTree() {
  await mimc.initMimc();

  const deposits = await depositsStorage();

  const allowlists = await allowlistStorage();

  const commitmentsTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

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
