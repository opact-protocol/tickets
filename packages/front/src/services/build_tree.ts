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

type LocalStorageTree = {
  lastIndex: string | null,
  array: Array<any>
}

export async function buildTree() {
  await mimc.initMimc();

  // const deposit = await getDeposits();
  // const allowlist = await getAllowLists();
  // const lastDeposit = await getLastDeposit();
  // const lastAllowList = await getLastAllowlist();

  if (!verifyStorage("deposit")) {
    localStorage.setItem("deposit", JSON.stringify({
      despositLastIndex: null,
      depositStorage: []
    }));
  } else {
    const {despositLastIndex, depositStorage} = JSON.parse(localStorage.getItem("deposit")!);

    const lastDeposit = await getLastDeposit();

    let newStorage;
    if (!despositLastIndex || Number(despositLastIndex) < Number(lastDeposit)) {
      const qtyToQuery = Number(lastDeposit) - Number(despositLastIndex || 0);
      
      const newValues = await getDeposits(lastDeposit, qtyToQuery)

      newStorage = [...depositStorage, ...newValues];
    } else {
      newStorage = depositStorage;
    }
    
    localStorage.setItem("deposit", JSON.stringify({
      despositLastIndex: lastDeposit,
      depositStorage: newStorage
    }));
  }

  if (!verifyStorage("allowlist")) {
    localStorage.setItem("allowlist", JSON.stringify(allowlist));
  } else {
    const allowlistStorage = JSON.parse(localStorage.getItem("allowlist")!);

    const newStorage = [...allowlistStorage, ...lastAllowList];

    localStorage.setItem("allowlist", JSON.stringify(newStorage));
  }

  const commitmentsTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  deposit.forEach(({ index, value }) => {
    try {
      commitmentsTree.update(index, value);
    } catch (e) {
      console.warn(e);
    }
  });

  const whitelistTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  allowlist.forEach(({ index, value }) => {
    try {
      whitelistTree.update(index, value);
    } catch (e) {
      console.warn(e);
    }
  });

  // localStorage.setItem("allowlist", JSON.stringify({
  //   allowlistLastIndex: allowlistLastIndex,
  //   allowlistStorage: whitelistTree.elements()
  // }));

  return { commitmentsTree, whitelistTree };
}
