import {
  getAllowLists,
  getDeposits,
  getLastAllowlist,
  getLastDeposit,
} from "./graphql-queries";

import { verifyStorage } from "./verify-storage";

interface Storage {
  __typename: string;
  id: string;
  contract: string;
  index: string;
  signer: string;
  value: string;
  counter: string;
}

const methods = {
  deposit: "hyc-deposits",
  allowlist: "hyc-allowlists",
};

export const depositsStorage = async () => {
  let deposits: Storage[];
  let newStorage: Storage[];

  if (!verifyStorage(methods.deposit)) {
    localStorage.setItem(
      methods.deposit,
      JSON.stringify({ despositLastIndex: null, depositStorage: [] })
    );
  } else {
    const { despositLastIndex, depositStorage } = JSON.parse(
      localStorage.getItem(methods.deposit)!
    );

    const lastDeposit = await getLastDeposit();

    if (!despositLastIndex || +despositLastIndex < +lastDeposit) {
      const qtyToQuer = +lastDeposit - +despositLastIndex || 0;

      deposits = await getDeposits(
        despositLastIndex || "0",
        qtyToQuer.toString()
      );

      newStorage = [...depositStorage, ...deposits];
    } else {
      newStorage = depositStorage;
    }

    localStorage.setItem(
      methods.deposit,
      JSON.stringify({
        despositLastIndex: lastDeposit,
        depositStorage: newStorage,
      })
    );
    return newStorage;
  }
};

export const allowlistStorage = async () => {
  let allowlists: Storage[];
  let newStorage: Storage[];

  if (!verifyStorage(methods.allowlist)) {
    localStorage.setItem(
      methods.allowlist,
      JSON.stringify({ allowlistLastIndex: null, allowlistStorage: [] })
    );
  } else {
    const { allowlistLastIndex, allowlistStorage } = JSON.parse(
      localStorage.getItem(methods.allowlist)!
    );

    const lastAllowlist = await getLastAllowlist();

    if (!allowlistLastIndex || +allowlistLastIndex < +lastAllowlist) {
      const qtyToQuer = +lastAllowlist - allowlistLastIndex || 0;

      allowlists = await getAllowLists(
        allowlistLastIndex || "0",
        qtyToQuer.toString()
      );
      newStorage = [...allowlistStorage, ...allowlists];
    } else {
      newStorage = allowlistStorage;
    }

    localStorage.setItem(
      methods.allowlist,
      JSON.stringify({
        allowlistLastIndex: lastAllowlist,
        allowlistStorage: newStorage,
      })
    );
    return newStorage;
  }
};
