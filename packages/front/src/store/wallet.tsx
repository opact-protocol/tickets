import { create } from "zustand";
import { WalletSelector, setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { useEnv } from "@/hooks/useEnv";
import { viewAccountBalance, getAccountBalance } from "hideyourcash-sdk";
import { getAllCurrencies, viewIsInAllowlist } from "@/utils/sdk";
import { sendAllowlist } from "../utils/sdk";

interface Balance {
  available: string;
}

const nodeUrl = useEnv("VITE_NEAR_NODE_URL");

export interface WalletStore {
  toggleModal: () => void;
  signOut: () => Promise<void>;
  initWallet: () => Promise<string>;
  viewBalance: (contract: string) => Promise<void>;
  sendWhitelist: () => Promise<void>;
  viewNearBalance: (foo: any) => Promise<any>;
  accountId: string | null;
  showWalletModal: boolean;
  selector: WalletSelector | null;
  viewAccountBalance: (foo: any, baa: any) => void;
  allCurrencies: any;
  allowlist: boolean;
  nearBalance: number,
  tokenBalance: number,
  isStarted: boolean
}

export const useWallet = create<WalletStore>((set, get) => ({
  accountId: "",
  selector: null,
  showWalletModal: false,
  allCurrencies: [],
  allowlist: false,
  nearBalance: 0,
  tokenBalance: 0,
  isStarted: false,

  toggleModal: () => {
    const { showWalletModal } = get();

    set(() => ({ showWalletModal: !showWalletModal }));
  },

  viewAccountBalance: async ({ accountId }, currencies) => {
    const { viewBalance, viewNearBalance } = get();

    const token = currencies.find((token) => {
      if ("account_id" in token) return token;
    });

    if (!token) return;

    const balance = await viewBalance(token.account_id!);

    const { available } = await viewNearBalance({ accountId });

    set({ nearBalance: +available, tokenBalance: +balance });
  },

  initWallet: async () => {
    const { viewAccountBalance } = get()

    const newSelector = await setupWalletSelector({
      network: useEnv("VITE_NEAR_NETWORK"),
      debug: true,
      modules: [
        setupMeteorWallet(),
        setupNearWallet(),
        setupMyNearWallet(),
        setupSender(),
        setupNightly(),
        setupWelldoneWallet(),
        setupXDEFI(),
        setupHereWallet(),
      ],
    });

    const state = newSelector.store.getState();

    const newAccount =
      state?.accounts.find((account) => account.active)?.accountId || "";

    const allCurrencies = await getAllCurrencies();
    const allowlist = await viewIsInAllowlist({ accountId: newAccount });
    await viewAccountBalance({ accountId: newAccount }, allCurrencies)

    try {
      set(() => ({
        accountId: newAccount,
        selector: newSelector,
        allowlist,
        allCurrencies,
        isStarted: true
      }));
    } catch (e) {
      console.warn(e);

      return "";
    }

    return newAccount;
  },

  signOut: async () => {
    const { selector } = get();

    if (!selector) {
      return;
    }

    const wallet = await selector.wallet();

    try {
      await wallet.signOut();
    } catch (e) {
      console.warn(e);

      return;
    }

    set(() => ({ accountId: "" }));
  },

  viewBalance: async (contract: string) => {
    const { accountId } = get();

    if (!accountId) return;

    return await viewAccountBalance(
      useEnv("VITE_NEAR_NODE_URL"),
      contract,
      accountId
    );
  },

  sendWhitelist: async () => {
    const { selector, accountId } = get();
    if (!accountId) return;

    await sendAllowlist({
      accountId,
      connection: selector
    });
  },

  viewNearBalance: async ({ accountId }): Promise<any> => {
    if (!accountId) {
      return {
        available: "0",
      };
    }

    const res = (await getAccountBalance({
      nodeUrl,
      accountId,
    })) as any;

    return {
      available: res?.amount || '0',
    } as Balance;
  },
}));
