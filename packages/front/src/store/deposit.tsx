import { DepositStore } from "@/interfaces";
import { hycService } from "@/lib";
import {
  getLastDepositOfContract,
  getLastWithdrawalOfContract,
} from "@/utils/graphql-queries";
import { Currency } from "hideyourcash-sdk";
import { create } from "zustand";

const hycTransaction = "hyc-transaction";

export const useDeposit = create<DepositStore>((set, get) => ({
  hash: "",
  note: "",
  depositScore: 0,
  prepareDeposit: async (account: string, currencieContract: string) => {
    const { hash, note } = await hycService.createTicket(
      account,
      currencieContract
    );

    set({
      hash,
      note,
    });

    return hash;
  },

  sendDeposit: async (
    amount: string,
    depositContract: string,
    accountId: string,
    currency: Currency,
    connection: any
  ) => {
    hycService.sendDeposit(
      get().hash,
      amount,
      depositContract,
      accountId,
      currency,
      connection
    );
    localStorage.removeItem(hycTransaction);
  },

  poolDepositScore: async (contract: string) => {
    const lastDeposit = await getLastDepositOfContract(contract);
    const lastWithdrawal = await getLastWithdrawalOfContract(contract);

    const depositCounter = lastDeposit.length > 0 ? +lastDeposit[0].counter : 0;
    const withdrawalCounter =
      lastWithdrawal.length > 0 ? +lastWithdrawal[0].counter : 0;

    const score = depositCounter - withdrawalCounter;

    set({ depositScore: score });
  },
}));
