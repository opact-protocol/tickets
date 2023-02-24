import { merkleTreeMethods } from "@/constants";

export const parseNote = (note: string): {
  secret: string;
  nullifier: string;
  account_hash: string;
} => {
  const splitString = note.split("-");

  return {
    secret: splitString[0],
    nullifier: splitString[1],
    account_hash: splitString[2],
  };
}

export const getMerkleTreeDeposit = async () => {
  let deposits: Storage[];
  let newStorage: Storage[];

  const { despositLastIndex, depositStorage } = JSON.parse(
    localStorage.getItem(merkleTreeMethods.deposit)!
  );

  const lastDeposit = await getLastDeposit();

  const qtyToQuer = +lastDeposit - +despositLastIndex || 0;

  return getDeposits(
    despositLastIndex || "0",
    qtyToQuer.toString()
  );
}
