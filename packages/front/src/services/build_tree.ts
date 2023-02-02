import { MerkleTree } from "fixed-merkle-tree";
import { client } from "./graphqlClient";
import { gql } from "@apollo/client";
import { mimc } from "./mimc";
import {
  getAllowLists,
  getDeposits,
  getLastAllowlist,
  getLastDeposit
} from "@/utils/graphql-queries";
import { verifyStorage } from "@/utils/verify-storage";

const MERKLE_TREE_OPTIONS = {
  zeroElement:
    "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  hashFunction: mimc.hash
};

export async function buildTree() {
  await mimc.initMimc();

  if (!verifyStorage("deposit")) {
    localStorage.setItem(
      "deposit",
      JSON.stringify({ lastIndex: null, depositStorage: [] })
    );
  } else {
    const lastDeposit = await getLastDeposit();

    const { lastIndex, depositStorage } = JSON.parse(
      localStorage.getItem("deposit")!
    );

    if (Number(lastIndex) < Number(lastDeposit)) {
      const lenStorage = Number(lastDeposit) - Number(lastIndex);

      const deposits = await getDeposits(
        lastIndex || "0",
        lenStorage.toString()
      );

      const newStorage = depositStorage.concat(deposits);

      localStorage.setItem(
        "deposit",
        JSON.stringify({ lastIndex: lastDeposit, depositStorage: newStorage })
      );

      deposits.forEach(({ index, value }) => {
        try {
          commitmentsTree.update(index, value);
        } catch (e) {
          console.warn(e);
        }
      });
    }
  }

  if (!verifyStorage("allowlist")) {
    localStorage.setItem(
      "allowlist",
      JSON.stringify({ lastIndex: null, allowlistStorage: [] })
    );
  } else {
    const lastAllowlist = await getLastAllowlist();

    const { lastIndex, allowlistStorage } = JSON.parse(
      localStorage.getItem("allowlist")!
    );

    if (Number(lastIndex) < Number(lastAllowlist)) {
      const lenStorage = Number(lastAllowlist) - Number(lastIndex);

      const allowlists = await getAllowLists(
        lastIndex || "0",
        lenStorage.toString()
      );

      const newStorage = allowlistStorage.concat(allowlists);
      console.log(newStorage);
      localStorage.setItem(
        "allowlist",
        JSON.stringify({ lastIndex: lastAllowlist, depositStorage: newStorage })
      );

      allowlists.forEach(({ index, value }) => {
        try {
          whitelistTree.update(index, value);
        } catch (e) {
          console.warn(e);
        }
      });
    }
  }
  const commitmentsTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  const whitelistTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  return { commitmentsTree, whitelistTree };
}
