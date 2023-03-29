import { AmountsProps, DepositStore } from "@/interfaces";
import { hycService } from "@/lib";
import {
  getLastDepositOfContract,
  getLastWithdrawalOfContract,
} from "@/utils/graphql-queries";
import {
  Currency,
  CurrencyContract,
  formatBigNumberWithDecimals,
  getDecimals,
  ViewCurrenciesResponseInterface,
} from "hideyourcash-sdk";
import { create } from "zustand";
import { useApp } from "./application";
import { useModal } from "./modal";
import { useWallet } from "./wallet";

const hycTransaction = "hyc-transaction";

export const useDeposit = create<DepositStore>((set, get) => ({
  hash: "",
  note: "",
  errorMessage: "",
  buttonText: "Deposit",
  selectedToken: null,
  selectedAmount: null,
  depositScore: 0,
  sendingDeposit: false,
  copyTicket: false,
  showAllowlistModal: false,
  depositing: false,
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

  preDeposit: async (haveBalance: boolean) => {
    const { accountId } = useWallet.getState();
    const { toggleHashModal } = useModal.getState();
    const { allowlist } = useApp.getState();
    const { selectedToken, selectedAmount, prepareDeposit } = get();

    if (!selectedToken) {
      set({ errorMessage: "Select token to deposit" });
      return;
    }

    if (!selectedAmount) {
      set({ errorMessage: "Select amount to deposit" });
      return;
    }
    if (!haveBalance) {
      set({ errorMessage: "Your account doesn't have enough balance" });
      return;
    }

    if (!allowlist) {
      set({ showAllowlistModal: true });
      return;
    }
    set({ buttonText: "Preparing your deposit...", depositing: true });
    await prepareDeposit(accountId!, selectedAmount!.accountId);
    toggleHashModal();
    set({
      showAllowlistModal: false,
      buttonText: "Deposit",
      depositing: false,
    });
  },

  deposit: async () => {
    const { sendDeposit, selectedAmount, selectedToken } = get();

    const { accountId, selector } = useWallet.getState();

    set({
      sendingDeposit: true,
    });

    try {
      await sendDeposit(
        selectedAmount!.value,
        selectedAmount!.accountId,
        accountId!,
        selectedToken,
        selector!
      );

      set({ sendingDeposit: false, copyTicket: false });
    } catch (error) {
      console.warn(error);
    }
  },

  poolDepositScore: async () => {
    const { selectedAmount } = get();

    const lastDeposit = await getLastDepositOfContract(
      selectedAmount!.accountId
    );
    const lastWithdrawal = await getLastWithdrawalOfContract(
      selectedAmount!.accountId
    );
    const depositCounter = lastDeposit.length > 0 ? +lastDeposit[0].counter : 0;
    const withdrawalCounter =
      lastWithdrawal.length > 0 ? +lastWithdrawal[0].counter : 0;
    const score = depositCounter - withdrawalCounter;

    set({ depositScore: score });
  },

  formatAmounts: (data: CurrencyContract) => {
    const amounts: CurrencyContract[] = [];

    for (const value in data) {
      amounts.push({ value, accountId: data[value] });
    }

    return amounts.sort(
      (amountA, amountB) => Number(amountA.value) - Number(amountB.value)
    );
  },
  setSelectedToken: (payload: ViewCurrenciesResponseInterface) => {
    set({ selectedToken: payload, errorMessage: "" });
  },

  setSelectedAmount: (payload: AmountsProps | null) => {
    set({ selectedAmount: payload, errorMessage: "" });
  },
  setAllowlistModal: (state: boolean) => {
    set({ showAllowlistModal: state });
  },
  setCopyTicket: (state: boolean) => {
    set({ copyTicket: state });
  },
  handleButtonText: (buttonText: string) => {
    if (buttonText) {
      return buttonText;
    }
    const { selectedAmount, selectedToken } = get();
    const formatedNumber = Number(
      formatBigNumberWithDecimals(
        selectedAmount!.value,
        getDecimals(
          selectedToken.type === "Near" ? 24 : selectedToken.metadata.decimals
        )
      )
    ).toFixed(0);

    const tokenName =
      selectedToken.type === "Near" ? "Near" : selectedToken.metadata.name;

    return `Deposit ${formatedNumber} ${tokenName}`;
  },
}));
